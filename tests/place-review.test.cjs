const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Compile the real TS/TSX modules without adding a test-runner dependency.
function load(relativePath, mocks = {}) {
  const filename = path.resolve(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  const realRequire = createRequire(filename);
  const requireWithMocks = (name) => Object.hasOwn(mocks, name) ? mocks[name] : realRequire(name);
  new Function('require', 'module', 'exports', source)(requireWithMocks, module, module.exports);
  return module.exports;
}

class ApiError extends Error {
  constructor(status) { super(`HTTP ${status}`); this.status = status; }
}

test('plan review requests preserve content/tags and use the documented POST/PATCH paths', async () => {
  const requests = [];
  const api = load('api/travel-review.ts', {
    '@/lib/api-client': { ApiError, apiRequest: async (url, options) => { requests.push({ url, options }); return { placeReviewId: 'saved' }; } },
  });
  const input = { rating: 4, content: '방문 후기\n두 번째 줄', tags: ['야경'], stayMinutes: 45 };
  await api.createPlanPlaceReview('travel', 'place', input);
  await api.updatePlanPlaceReview('travel', 'place', input);
  assert.deepEqual(requests.map(({ options }) => options.method), ['POST', 'PATCH']);
  for (const request of requests) {
    assert.equal(request.url, '/api/v1/travels/travel/plans/places/place/review');
    assert.deepEqual(JSON.parse(request.options.body), input);
    assert.equal(Object.hasOwn(JSON.parse(request.options.body), 'mediaFileKeys'), false);
  }
});

test('missing plan review is empty, but authorization/server failures stay errors', async () => {
  for (const status of [404, 401, 403, 500]) {
    const api = load('api/travel-review.ts', {
      '@/lib/api-client': { ApiError, apiRequest: async () => { throw new ApiError(status); } },
    });
    if (status === 404) assert.equal(await api.getPlanPlaceReview('travel', 'place'), null);
    else await assert.rejects(api.getPlanPlaceReview('travel', 'place'), { status });
  }
});

test('public lookup encodes the provider place ID', async () => {
  let url;
  const api = load('api/travel-review.ts', {
    '@/lib/api-client': { ApiError, apiRequest: async (value) => { url = value; return { reviews: [] }; } },
  });
  await api.getPublicPlaceReviews('provider/id & 부산');
  assert.equal(new URL(url, 'https://example.test').searchParams.get('placeId'), 'provider/id & 부산');
});

function renderReview(query, props = {}) {
  const { StoryPlaceReview } = load('app/[locale]/stories/[storyId]/components/StoryPlaceReview.tsx', {
    '@/hooks/use-plan-place-review': { usePublicPlaceReviews: () => query },
  });
  return renderToStaticMarkup(React.createElement(StoryPlaceReview, {
    storyId: 'story-a', placeId: 'visit-a', providerPlaceId: 'provider-id', ...props,
  }));
}

test('detail matches both travel record and visit, even for repeated visits to the same place', () => {
  const base = { rating: 4, tags: ['야경'], stayMinutes: 45 };
  const html = renderReview({ data: { reviews: [
    { ...base, travelRecordId: 'story-b', travelRecordPlaceId: 'visit-a', content: '다른 여행기 내용' },
    { ...base, travelRecordId: 'story-a', travelRecordPlaceId: 'visit-b', content: '다른 방문 내용' },
    { ...base, travelRecordId: 'story-a', travelRecordPlaceId: 'visit-a', content: '정확한 방문 후기' },
  ] } });
  assert.match(html, /정확한 방문 후기/);
  assert.match(html, /야경/);
  assert.match(html, /45분/);
  assert.doesNotMatch(html, /다른 여행기 내용|다른 방문 내용/);
});

test('detail distinguishes loading, errors, missing identifiers, no review, and rating-only reviews', () => {
  assert.match(renderReview({ isPending: true }), /불러오는 중/);
  assert.match(renderReview({ isError: true }), /불러오지 못했어요/);
  assert.doesNotMatch(renderReview({ isError: true }), /작성된 방문 후기가 없어요/);
  assert.match(renderReview({}, { providerPlaceId: null }), /식별 정보가 없어/);
  assert.match(renderReview({ data: { reviews: [] } }), /작성된 방문 후기가 없어요/);
  assert.match(renderReview({ data: { reviews: [{ travelRecordId: 'story-a', travelRecordPlaceId: 'visit-a', rating: 5, content: ' ', tags: [] }] } }), /별점만 남긴 후기/);
});

test('the detail adapter never presents itinerary memo or overall rating as a place review', () => {
  const { detailRecordToStory } = load('app/[locale]/stories/travel-record-adapter.ts');
  const story = detailRecordToStory({
    travelRecordId: 'story-a', overallRating: 5, days: [{ places: [{
      travelRecordPlaceId: 'visit-a', placeName: '호텔', memo: '체크인 4시', sequence: 1,
    }] }],
  });
  assert.equal(story.places[0].review, '');
  assert.equal(story.places[0].rating, 0);
});

test('saving chooses create/update from explicit server state and updates the review cache', async () => {
  for (const exists of [false, true]) {
    const calls = [];
    const saved = { placeReviewId: 'saved', content: '저장된 후기' };
    const cache = [];
    const { useSavePlanPlaceReview } = load('hooks/use-plan-place-review.ts', {
      '@tanstack/react-query': {
        useMutation: (options) => options,
        useQuery: () => ({}),
        useQueries: () => ({}),
        useQueryClient: () => ({ setQueryData: (...args) => cache.push(args) }),
      },
      '@/api/travel-review': {
        createPlanPlaceReview: async (...args) => { calls.push(['POST', ...args]); return saved; },
        updatePlanPlaceReview: async (...args) => { calls.push(['PATCH', ...args]); return saved; },
      },
    });
    const mutation = useSavePlanPlaceReview('travel', 'place');
    const input = { rating: 5, content: '저장된 후기', tags: [], stayMinutes: 30 };
    const result = await mutation.mutationFn({ request: input, exists });
    mutation.onSuccess(result);
    assert.deepEqual(calls[0], [exists ? 'PATCH' : 'POST', 'travel', 'place', input]);
    assert.deepEqual(cache[0], [['plan-place-review', 'travel', 'place'], saved]);
  }
});
