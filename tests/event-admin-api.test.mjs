import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

function load(file, dependencies = {}) {
  const source = fs.readFileSync(path.resolve(import.meta.dirname, '..', file), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const testModule = { exports: {} };
  new Function('require', 'module', 'exports', output)(
    (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
      return dependencies[name];
    },
    testModule,
    testModule.exports
  );
  return testModule.exports;
}
const logic = load('lib/event-admin-api.ts');
const constants = load('constants/event-admin-api.ts', {
  './event-admin': { ADMIN_EVENT_ZONES: [{ id: 'YEONGDO', name: '영도' }] },
});

test('unwraps envelope, preserves plain upload payload and 204, rejects failed envelopes', () => {
  assert.deepEqual(logic.adminData({ success: true, data: { items: [] } }), { items: [] });
  assert.equal(logic.adminData(null), null);
  assert.deepEqual(logic.adminData({ fileKey: 'photo' }), { fileKey: 'photo' });
  assert.throws(() => logic.adminData({ success: false, message: 'denied' }), /denied/);
  assert.throws(() => logic.adminData({ bad: undefined }));
});
test('pagination keeps totals and cursor; stats and titles lists are supported', () => {
  assert.equal(logic.adminRows({ items: [], page: 2, totalPages: 4, totalElements: 80 }).page, 2);
  assert.equal(
    logic.adminRows({ items: [], nextCursor: 'next', hasNext: true }).nextCursor,
    'next'
  );
  assert.equal(logic.adminRows({ slots: [{ joinedCount: 2 }] }).items[0].joinedCount, 2);
  assert.equal(logic.adminRows([{ titleDefId: 'title' }]).totalElements, 1);
});
test('form sends nested rewards and UTC converted from Korean local time', () => {
  const fields = [
    { key: 'startsAt', type: 'datetime-local', label: '시작', required: true },
    { key: 'reward.points', type: 'number', min: 0, label: '포인트' },
    { key: 'retroactive', type: 'checkbox', label: '소급' },
  ];
  const fixed = { expectedRevision: 8 };
  assert.deepEqual(
    logic.adminBody(
      fields,
      { startsAt: '2026-09-12T18:00', 'reward.points': '50', retroactive: 'false' },
      fixed
    ),
    {
      expectedRevision: 8,
      startsAt: '2026-09-12T09:00:00.000Z',
      reward: { points: 50 },
      retroactive: false,
    }
  );
  assert.deepEqual(fixed, { expectedRevision: 8 });
  assert.throws(() => logic.adminBody(fields, {}));
  assert.throws(() =>
    logic.adminBody([{ key: 'radiusM', type: 'number', min: 30, max: 500, label: '반경' }], {
      radiusM: '20',
    })
  );
});
test('review uses latest submission revision and never calls payout endpoint', () => {
  const operations = constants.adminOperations('reviews', {
    participationId: 'p1',
    currentSubmission: { submissionId: 's2', revision: 7 },
  });
  const approve = operations.find((o) => o.label === '사진 승인');
  assert.equal(approve.path, '/admin/zone-event-reviews/p1/approve');
  assert.deepEqual(approve.fixed, { submissionId: 's2', expectedRevision: 7 });
  assert.ok(!operations.some((o) => o.path.includes('payout')));
});
test('target mutations use event-scoped path and fetched revision', () => {
  const operations = constants.adminOperations(
    'targets',
    { targetId: 't1', revision: 3 },
    '/admin/zone-events/e1/targets'
  );
  assert.equal(operations[0].path, '/admin/zone-events/e1/targets/t1');
  assert.equal(operations[0].fixed.expectedRevision, 3);
  assert.ok(operations.some((o) => o.path.endsWith('/replace')));
});
test('report supports HOLD only and payout mail records only apply to special rewards', () => {
  assert.equal(
    constants.adminOperations('reports', { reportId: 'r', revision: 2 })[0].fixed.action,
    'HOLD'
  );
  assert.ok(
    !constants
      .adminOperations('payouts', { payoutId: 'p', payoutType: 'BASE', revision: 1 })
      .some((o) => o.path.includes('mark-mail'))
  );
  assert.ok(
    constants
      .adminOperations('payouts', { payoutId: 'p', payoutType: 'TOP_LIKE', revision: 1 })
      .some((o) => o.path === '/admin/reward-payouts/mark-mail-sent')
  );
});
test('transport sends bearer, preserves idempotency key, supports multipart and 204', async () => {
  const originalFetch = globalThis.fetch;
  let request;
  const api = load('api/event-admin.ts', {
    '@/stores/auth-store': {
      getAuthorizationHeader: () => 'Bearer test-session',
      useAuthStore: { getState: () => ({ clearSession() {} }) },
    },
    '@/lib/api-client': {
      ApiError: class extends Error {
        constructor(message, status) {
          super(message);
          this.status = status;
        }
      },
    },
    '@/lib/event-admin-api': logic,
  });
  try {
    globalThis.fetch = async (url, init) => {
      request = { url, init };
      return new Response(null, { status: 204 });
    };
    assert.equal(
      await api.eventAdminRequest('/admin/zone-titles/t', { method: 'DELETE', key: 'same-key' }),
      null
    );
    assert.ok(request.url.endsWith('/api/v1/admin/zone-titles/t'));
    assert.equal(request.init.headers.get('Authorization'), 'Bearer test-session');
    assert.equal(request.init.headers.get('Idempotency-Key'), 'same-key');
    const body = new FormData();
    body.append('file', new Blob(['image']), 'test.png');
    await api.eventAdminRequest('/files', { method: 'POST', body });
    assert.equal(request.init.headers.get('Content-Type'), null);
    assert.equal(request.init.body, body);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: false, message: 'conflict' }), { status: 409 });
    await assert.rejects(api.eventAdminRequest('/admin/reward-payouts'), (e) => e.status === 409);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: false }), { status: 403 });
    await assert.rejects(api.eventAdminRequest('/admin/zone-events'), /ADMIN/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
