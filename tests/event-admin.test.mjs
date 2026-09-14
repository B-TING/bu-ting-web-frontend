import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

function load(relative) {
  const source = fs.readFileSync(path.resolve(import.meta.dirname, '..', relative), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = { exports: {} };
  new Function('module', 'exports', compiled)(loaded, loaded.exports);
  return loaded.exports;
}
const ops = load('lib/event-admin.ts');
const { createEventAdminDemo } = load('lib/event-admin-demo.ts');
const now = Date.parse('2026-09-06T01:00:00Z');
const demo = () => createEventAdminDemo(now);

test('KST conversion is independent of host timezone', () => {
  assert.equal(ops.fromKst('2026-09-06T10:00'), '2026-09-06T01:00:00.000Z');
  assert.equal(ops.kstInput('2026-09-06T01:00:00Z'), '2026-09-06T10:00');
});
test('scheduled start is inclusive and closing instant is exclusive', () => {
  const r = demo().rounds[0];
  assert.equal(ops.roundStatus(r, Date.parse(r.startsAt) - 1), '예정');
  assert.equal(ops.roundStatus(r, Date.parse(r.startsAt)), '진행 중');
  assert.equal(ops.roundStatus(r, Date.parse(r.endsAt)), '종료');
});
test('one participation per user/round/zone; a different zone is allowed', () => {
  const s = demo();
  assert.equal(ops.canJoin(s, 'demo-user-0', 'round-live', 'mission-0', now), false);
  assert.equal(ops.canJoin(s, 'demo-user-0', 'round-live', 'mission-1', now), true);
  assert.equal(ops.canJoin(s, 'new', 'round-live', 'mission-2', now), false);
  assert.equal(
    ops.canJoin(s, 'new', 'round-live', 'mission-0', Date.parse(s.rounds[0].endsAt)),
    false
  );
});
test('reject requires reason, keeps a historical immutable submission', () => {
  const s = demo();
  assert.throws(() => ops.reviewPhoto(s, 'participation-0', false, '  ', now));
  const next = ops.reviewPhoto(s, 'participation-0', false, '손이 보이지 않습니다.', now);
  assert.equal(ops.latestSubmission(s.participations[0]).status, 'PENDING');
  assert.equal(ops.latestSubmission(next.participations[0]).status, 'REJECTED');
});
test('resubmission at another alternative target retains one participation and old photo', () => {
  const s = ops.reviewPhoto(demo(), 'participation-0', false, '재촬영', now);
  const target = s.missions[0].places[1];
  const photo = {
    ...s.participations[0].submissions[0],
    id: 'resubmitted',
    placeName: target.name,
    targetId: target.id,
    latitude: target.latitude,
    longitude: target.longitude,
  };
  const next = ops.appendSubmission(s, 'participation-0', photo, now + 1000);
  assert.equal(next.participations.length, s.participations.length);
  assert.equal(next.participations[0].submissions.length, 2);
  assert.equal(next.participations[0].submissions[0].status, 'REJECTED');
  assert.equal(ops.latestSubmission(next.participations[0]).placeName, target.name);
  assert.equal(ops.latestSubmission(next.participations[0]).status, 'PENDING');
});
test('resubmission is rejected at close, after close, and outside radius', () => {
  const s = ops.reviewPhoto(demo(), 'participation-0', false, '재촬영', now);
  const photo = { ...s.participations[0].submissions[0], id: 'retry' };
  assert.throws(() =>
    ops.appendSubmission(s, 'participation-0', photo, Date.parse(s.rounds[0].endsAt))
  );
  assert.throws(() =>
    ops.appendSubmission(s, 'participation-0', photo, Date.parse(s.rounds[0].endsAt) + 1)
  );
  assert.throws(() => ops.appendSubmission(s, 'participation-0', { ...photo, latitude: 0 }, now));
});
test('approval after close is allowed but does not grant reward automatically', () => {
  const s = demo();
  const next = ops.reviewPhoto(s, 'participation-0', true, '', Date.parse(s.rounds[0].endsAt) + 1);
  assert.equal(ops.latestSubmission(next.participations[0]).status, 'APPROVED');
  assert.equal(next.participations[0].delivery, 'PENDING');
  assert.equal(next.participations[0].rewardSnapshot, undefined);
  assert.throws(() => ops.reviewPhoto(next, 'participation-0', true, '', now));
});
test('emergency cancellation preserves participation review and reward eligibility', () => {
  const s = demo();
  s.rounds[0].cancelled = true;
  const before = structuredClone(s.participations);
  assert.equal(ops.canJoin(s, 'new', 'round-live', 'mission-0', now), false);
  assert.deepEqual(s.participations, before);
  const approved = ops.reviewPhoto(s, 'participation-0', true, '', now);
  assert.equal(
    ops.advanceReward(approved, ['participation-0'], now).participations[0].delivery,
    'CONFIRMED'
  );
});
test('round must have exactly four different zones and no overlapping zone schedule', () => {
  const s = demo();
  const r = { ...s.rounds[0], id: 'new' };
  assert.throws(() => ops.validateRound({ ...r, missionIds: ['mission-0'] }, s));
  assert.throws(() =>
    ops.validateRound({ ...r, missionIds: ['mission-0', 'mission-0', 'mission-1', 'mission-2'] }, s)
  );
  assert.throws(() => ops.validateRound(r, s));
  assert.doesNotThrow(() =>
    ops.validateRound(
      {
        ...r,
        startsAt: s.rounds[0].endsAt,
        endsAt: new Date(Date.parse(s.rounds[0].endsAt) + 86400000).toISOString(),
      },
      s
    )
  );
});
test('mission rejects invalid geometry, empty places and noninteger rewards', () => {
  const m = demo().missions[0];
  m.places = m.places.map((p, i) => ({ ...p, placeContentId: String(100 + i) }));
  assert.doesNotThrow(() => ops.validateMission(m));
  assert.throws(() => ops.validateMission({ ...m, places: [] }));
  assert.throws(() => ops.validateMission({ ...m, places: [{ ...m.places[0], latitude: NaN }] }));
  assert.throws(() => ops.validateMission({ ...m, places: [{ ...m.places[0], radius: 0 }] }));
  assert.throws(() => ops.validateMission({ ...m, points: 1.5 }));
});

test('mission requires tourist references and rejects duplicate contentIds', () => {
  const m = demo().missions[0];
  assert.throws(() => ops.validateMission(m), /관광지 검색/);
  m.places = m.places.map((p) => ({ ...p, placeContentId: '100' }));
  assert.throws(() => ops.validateMission(m), /중복/);
});

test('tourist API response parsing and editable target preserve the content reference', () => {
  const places = load('lib/event-admin-places.ts');
  const data = {
    page: 1,
    size: 5,
    totalCount: 1,
    places: [
      {
        contentId: '123',
        contentTypeId: '12',
        title: '관광지',
        address: '부산',
        latitude: '35.1',
        longitude: '129.1',
      },
    ],
  };
  const parsed = places.parseAdminPlaceSearch({ success: true, data });
  const selected = places.targetFromTourPlace(demo().missions[0].places[0], parsed.places[0]);
  assert.equal(selected.placeContentId, '123');
  assert.equal(selected.latitude, 35.1);
  assert.equal(selected.sourceLatitude, 35.1);
  assert.equal(places.targetCoordinatesChanged(selected), false);
  const adjusted = { ...selected, latitude: 35.1001, longitude: 129.1001 };
  assert.equal(adjusted.placeContentId, '123');
  assert.equal(adjusted.sourceLatitude, 35.1);
  assert.equal(places.targetCoordinatesChanged(adjusted), true);
  assert.equal(parsed.places[0].latitude, 35.1);
  const restored = {
    ...adjusted,
    latitude: adjusted.sourceLatitude,
    longitude: adjusted.sourceLongitude,
  };
  assert.equal(places.targetCoordinatesChanged(restored), false);
  assert.throws(() => places.parseAdminPlaceSearch({ success: false, data: null }));
  assert.throws(() =>
    places.parseAdminPlaceSearch({ ...data, places: [{ ...data.places[0], contentId: '' }] })
  );
  assert.throws(() =>
    places.parseAdminPlaceSearch({ ...data, places: [{ ...data.places[0], latitude: '' }] })
  );
  assert.throws(() =>
    places.parseAdminPlaceSearch({ ...data, places: [{ ...data.places[0], longitude: Infinity }] })
  );
});
test('close snapshots likes once; approval after close cannot gain pre-close likes', () => {
  let s = demo();
  s = ops.reviewPhoto(s, 'participation-0', true, '', now);
  s.participations[0].liveLikes = 12;
  const end = Date.parse(s.rounds[0].endsAt);
  const frozen = ops.freezeClosedLikes(s, end);
  assert.equal(frozen.participations[0].likesAtClose, 12);
  frozen.participations[0].liveLikes = 999;
  assert.equal(ops.freezeClosedLikes(frozen, end + 1).participations[0].likesAtClose, 12);
  const late = ops.reviewPhoto(s, 'participation-1', true, '', end + 1);
  late.participations[1].liveLikes = 100;
  assert.equal(ops.freezeClosedLikes(late, end + 2).participations[1].likesAtClose, 0);
});
test('Top N is manual; tie candidates are selectable but cannot exceed zone quota', () => {
  let s = demo();
  assert.equal(s.participations.filter((p) => p.topWinner).length, 0);
  s = ops.selectWinner(s, 'participation-3', true, now);
  s = ops.selectWinner(s, 'participation-4', true, now);
  assert.throws(() => ops.selectWinner(s, 'participation-5', true, now));
  s = ops.selectWinner(s, 'participation-4', false, now);
  s = ops.selectWinner(s, 'participation-5', true, now);
  assert.equal(s.participations[5].topWinner, true);
  assert.throws(() => ops.selectWinner(demo(), 'participation-7', true, now));
});
test('reported, unapproved and future scheduled rewards are blocked atomically', () => {
  const s = demo();
  assert.throws(() => ops.advanceReward(s, ['participation-3', 'participation-6'], now));
  assert.equal(s.participations[3].delivery, 'PENDING');
  assert.throws(() => ops.advanceReward(s, ['participation-0'], now));
  s.participations[3].rewardAt = new Date(now + 1000).toISOString();
  assert.throws(() => ops.advanceReward(s, ['participation-3'], now));
});
test('final review enables scheduled reward, which has separate delivery milestones', () => {
  let s = demo();
  s.participations[6].reportResolved = true;
  for (const status of ['CONFIRMED', 'SENT']) {
    s = ops.advanceReward(s, ['participation-6'], now);
    assert.equal(s.participations[6].delivery, status);
  }
  assert.throws(() => ops.advanceReward(s, ['participation-6'], now));
});
test('base reward is preserved through mission edits, and confirmed reward is immutable', () => {
  let s = demo();
  s.missions[1].points = 999;
  s = ops.selectWinner(s, 'participation-3', true, now);
  s = ops.advanceReward(s, ['participation-3'], now);
  assert.equal(s.participations[3].rewardSnapshot.points, 50);
  const snapshot = structuredClone(s.participations[3].rewardSnapshot);
  s.rounds[1].specialReward = 'changed';
  s = ops.advanceReward(s, ['participation-3'], now);
  assert.deepEqual(s.participations[3].rewardSnapshot, snapshot);
  assert.doesNotThrow(() => ops.selectWinner(s, 'participation-3', false, now));
});

test('special award is independent of base reward and tracks mail, collection and delivery', () => {
  let s = demo();
  s = ops.advanceReward(s, ['participation-3'], now);
  s = ops.advanceReward(s, ['participation-3'], now);
  s = ops.selectWinner(s, 'participation-3', true, now);
  for (const status of ['CONFIRMED', 'EMAILED', 'COLLECTED', 'SENT']) {
    s = ops.advanceReward(s, ['participation-3'], now, true);
    assert.equal(s.participations[3].specialDelivery, status);
    assert.equal(s.participations[3].delivery, 'SENT');
  }
  assert.throws(() => ops.selectWinner(s, 'participation-3', false, now));
  assert.throws(() => ops.advanceReward(s, ['participation-3'], now, true));
  assert.throws(() => ops.advanceReward(s, ['participation-4'], now, true));
});
