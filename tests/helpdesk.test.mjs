import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Load the TypeScript module with isolated API dependencies; no live account/API needed.
function loadModule(relative, mocks = {}) {
  const filename = path.resolve(import.meta.dirname, '..', relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = name => {
    if (name in mocks) return mocks[name];
    if (name === '@/constants/helpdesk') return loadModule('constants/helpdesk.ts');
    if (name.startsWith('@/api/')) return {};
    throw new Error(`Unexpected import: ${name}`);
  };
  new Function('require', 'module', 'exports', compiled)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

test('specific intents win over generic tourist words; unknown input has no match', () => {
  const { matchHelpDeskIntent } = loadModule('lib/helpdesk.ts');
  for (const [text, expected] of [['관광지 해설 들려줘', 'guide'], ['근처 관광지·맛집 추천해줘', 'nearby'], ['비상 연락망 알려줘', 'emergency'], ['지금 진행 중인 축제는?', 'festivals'], ['인근 짐 보관소 위치', 'lockers'], ['다음 여행 일정 알려줘', 'schedule'], ['こんにちは', 'unknown']]) {
    assert.equal(matchHelpDeskIntent(text), expected);
  }
});

test('next stop ignores past dates and visited places, and sorts days and stops', () => {
  const { getNextHelpdeskStop } = loadModule('lib/helpdesk.ts');
  const plan = { days: [
    { visitDate: '2026-09-06', places: [{ sequence: 1, placeName: 'tomorrow' }] },
    { visitDate: '2026-09-04', places: [{ sequence: 1, placeName: 'past' }] },
    { visitDate: '2026-09-05', places: [{ sequence: 3, placeName: 'third' }, { sequence: 1, visited: true }, { sequence: 2, placeName: 'next' }] },
  ] };
  assert.equal(getNextHelpdeskStop(plan, '2026-09-05').place.placeName, 'next');
  assert.equal(getNextHelpdeskStop(plan, '2026-09-07'), null);
});

test('storage responses narrow unknown data and support content envelopes', () => {
  const { formatHelpdeskLockers } = loadModule('lib/helpdesk.ts');
  assert.deepEqual(formatHelpdeskLockers(null), []);
  assert.deepEqual(formatHelpdeskLockers({ content: [null, 3, {}, { stationName: '서면', detailLocation: 'B1' }] }), ['• 서면 — B1']);
});

test('festival answers exclude ended and future festivals', async () => {
  const service = loadModule('lib/helpdesk.ts', {
    '@/api/helpdesk': { getHelpdeskFestivals: async today => ({ festivals: [
      { title: 'ongoing', address: 'Busan', eventStartDate: today, eventEndDate: today },
      { title: 'ended', eventStartDate: '20000101', eventEndDate: '20000102' },
      { title: 'future', eventStartDate: '29990101', eventEndDate: '29990102' },
    ] }) },
  });
  const answer = await service.requestHelpDeskReply('', 'festivals', 'en', false);
  assert.match(answer, /ongoing/);
  assert.doesNotMatch(answer, /ended|future/);
});

test('anonymous schedule does not call authenticated endpoints; lookup errors propagate', async () => {
  const service = loadModule('lib/helpdesk.ts', { '@/api/helpdesk': { getHelpdeskLockers: async () => { throw new Error('offline'); } } });
  assert.match(await service.requestHelpDeskReply('', 'schedule', 'ko', false), /진행 중인 여행 일정이 없어요/);
  await assert.rejects(service.requestHelpDeskReply('', 'lockers', 'ko', false), /offline/);
});

test('active travel takes precedence over a planned travel and completed trips are excluded', () => {
  const { selectHelpdeskTravel } = loadModule('lib/helpdesk.ts');
  const travels = [
    { travelId: 'planned', status: 'PLANNED', startDate: '2026-09-01', endDate: '2026-09-10' },
    { travelId: 'active', status: 'IN_PROGRESS', startDate: '2026-09-04', endDate: '2026-09-08' },
    { travelId: 'done', status: 'COMPLETED', startDate: '2026-09-01', endDate: '2026-09-10' },
  ];
  assert.equal(selectHelpdeskTravel(travels, '2026-09-05').travelId, 'active');
  assert.equal(travels[0].travelId, 'planned');
});

test('nearby search uses complete coordinate pairs and reports the fallback basis', async () => {
  const requests = [];
  const service = loadModule('lib/helpdesk.ts', {
    '@/api/travel-team': { getMyTravels: async () => [{ travelId: 'active', status: 'IN_PROGRESS', startDate: '20260101', endDate: '2999-01-01' }] },
    '@/api/travel': { getTravelPlans: async () => ({ days: [{ visitDate: '2999-01-01', places: [{ sequence: 1, latitude: 36, longitude: null }] }] }) },
    '@/api/place-api': { getPlaceList: async request => { requests.push(request); return { places: [{ title: '부산', address: '주소' }] }; } },
  });
  const answer = await service.requestHelpDeskReply('', 'nearby', 'ko', true);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].mapY, 35.1796);
  assert.equal(requests[0].mapX, 129.0756);
  assert.match(answer, /부산 중심/);
});

