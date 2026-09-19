import type {
  AdminEventState,
  AdminEventRound,
  AdminEventMission,
  AdminEventParticipation,
  AdminEventSubmission,
  RewardDelivery,
} from '../types/event-admin';

export function roundStatus(round: AdminEventRound, now: number) {
  if (round.cancelled) return '취소';
  if (now < Date.parse(round.startsAt)) return '예정';
  return now < Date.parse(round.endsAt) ? '진행 중' : '종료';
}
export function kstInput(iso: string) {
  return new Date(Date.parse(iso) + 9 * 3600000).toISOString().slice(0, 16);
}
export function fromKst(input: string) {
  return new Date(`${input}:00+09:00`).toISOString();
}
export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
export function latestSubmission(p: AdminEventParticipation) {
  return p.submissions[p.submissions.length - 1];
}
export function distanceMeters(a: number, b: number, c: number, d: number) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((c - a) * rad) / 2) ** 2 +
    Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(((d - b) * rad) / 2) ** 2;
  return Math.round(6371000 * 2 * Math.asin(Math.min(1, Math.sqrt(h))));
}
export function validateMission(m: AdminEventMission) {
  if (!m.title.trim() || !m.condition.trim()) throw new Error('제목과 통과 조건을 입력해 주세요.');
  if (!m.places.length) throw new Error('선택 장소를 하나 이상 등록해 주세요.');
  if (m.places.some((p) => !p.placeContentId.trim()))
    throw new Error('모든 선택 장소를 관광지 검색 결과에서 선택해 주세요.');
  if (new Set(m.places.map((p) => p.placeContentId)).size !== m.places.length)
    throw new Error('같은 관광지는 미션에 중복 등록할 수 없습니다.');
  if (!Number.isInteger(m.points) || m.points < 0)
    throw new Error('포인트는 0 이상의 정수여야 합니다.');
  for (const p of m.places) {
    if (
      !p.name.trim() ||
      !Number.isFinite(p.latitude) ||
      Math.abs(p.latitude) > 90 ||
      !Number.isFinite(p.longitude) ||
      Math.abs(p.longitude) > 180 ||
      !Number.isInteger(p.radius) ||
      p.radius <= 0
    )
      throw new Error('장소명, 유효한 좌표와 양의 정수 반경을 입력해 주세요.');
  }
}
export function validateRound(r: AdminEventRound, state: AdminEventState) {
  if (
    !r.name.trim() ||
    !Number.isFinite(Date.parse(r.startsAt)) ||
    !Number.isFinite(Date.parse(r.endsAt)) ||
    Date.parse(r.startsAt) >= Date.parse(r.endsAt)
  )
    throw new Error('회차명과 올바른 시작·종료 시간을 입력해 주세요.');
  const missions = r.missionIds.map((id) => state.missions.find((m) => m.id === id));
  if (
    missions.length !== 4 ||
    missions.some((m) => !m) ||
    new Set(missions.map((m) => m?.zoneId)).size !== 4
  )
    throw new Error('서로 다른 4개 구역의 미션을 배정해 주세요.');
  if (!Number.isInteger(r.topN) || r.topN < 1 || !r.specialReward.trim())
    throw new Error('Top N과 특별 보상 내용을 입력해 주세요.');
  const zones = missions.map((m) => m?.zoneId);
  if (
    state.rounds.some(
      (other) =>
        other.id !== r.id &&
        !other.cancelled &&
        Date.parse(r.startsAt) < Date.parse(other.endsAt) &&
        Date.parse(other.startsAt) < Date.parse(r.endsAt) &&
        other.missionIds.some((id) =>
          zones.includes(state.missions.find((m) => m.id === id)?.zoneId)
        )
    )
  )
    throw new Error('같은 구역의 다른 회차와 운영 시간이 겹칩니다.');
}
export function canResubmit(p: AdminEventParticipation, r: AdminEventRound, now: number) {
  return (
    latestSubmission(p)?.status === 'REJECTED' &&
    roundStatus(r, now) === '진행 중' &&
    !r.cancelledMissionIds.includes(p.missionId)
  );
}
export function canJoin(
  state: AdminEventState,
  userId: string,
  roundId: string,
  missionId: string,
  now: number
) {
  const r = state.rounds.find((r) => r.id === roundId);
  const m = state.missions.find((m) => m.id === missionId);
  return Boolean(
    r &&
      m &&
      roundStatus(r, now) === '진행 중' &&
      r.missionIds.includes(m.id) &&
      !r.cancelledMissionIds.includes(m.id) &&
      !state.participations.some(
        (p) =>
          p.userId === userId &&
          p.roundId === roundId &&
          state.missions.find((other) => other.id === p.missionId)?.zoneId === m.zoneId
      )
  );
}
export function appendSubmission(
  state: AdminEventState,
  participationId: string,
  submission: AdminEventSubmission,
  now: number
): AdminEventState {
  const p = state.participations.find((p) => p.id === participationId);
  const r = state.rounds.find((r) => r.id === p?.roundId);
  const m = state.missions.find((m) => m.id === p?.missionId);
  if (!p || !r || !m || !canResubmit(p, r, now)) throw new Error('재제출할 수 없는 참여입니다.');
  const target = m.places.find((place) => place.id === submission.targetId);
  if (
    !Number.isFinite(submission.latitude) ||
    Math.abs(submission.latitude) > 90 ||
    !Number.isFinite(submission.longitude) ||
    Math.abs(submission.longitude) > 180
  )
    throw new Error('유효한 제출 좌표가 필요합니다.');
  if (
    !target ||
    distanceMeters(submission.latitude, submission.longitude, target.latitude, target.longitude) >
      target.radius
  )
    throw new Error('선택 장소의 허용 반경 밖입니다.');
  return {
    ...state,
    participations: state.participations.map((item) =>
      item.id === p.id
        ? {
            ...item,
            submissions: [
              ...item.submissions,
              {
                ...submission,
                targetId: target.id,
                placeContentId: target.placeContentId,
                placeName: target.name,
                targetLatitude: target.latitude,
                targetLongitude: target.longitude,
                radius: target.radius,
                condition: m.condition,
                submittedAt: new Date(now).toISOString(),
                status: 'PENDING',
                reason: '',
              },
            ],
          }
        : item
    ),
  };
}
export function reviewPhoto(
  state: AdminEventState,
  id: string,
  approve: boolean,
  reason: string,
  now = Date.now()
): AdminEventState {
  const p = state.participations.find((p) => p.id === id);
  const s = p && latestSubmission(p);
  if (!p || !s || s.status !== 'PENDING') throw new Error('검수 대기 사진만 처리할 수 있습니다.');
  if (!approve && !reason.trim()) throw new Error('반려 사유를 입력해 주세요.');
  return {
    ...state,
    participations: state.participations.map((item) =>
      item.id === id
        ? {
            ...item,
            submissions: item.submissions.map((photo) =>
              photo.id === s.id
                ? {
                    ...photo,
                    status: approve ? 'APPROVED' : 'REJECTED',
                    reason: approve ? '' : reason.trim(),
                    reviewedAt: new Date(now).toISOString(),
                  }
                : photo
            ),
          }
        : item
    ),
  };
}
// Demo clock projection. Production requires a server-side close job and immutable like snapshot.
export function freezeClosedLikes(state: AdminEventState, now: number): AdminEventState {
  let changed = false;
  const participations = state.participations.map((p) => {
    const r = state.rounds.find((r) => r.id === p.roundId);
    if (!r || p.likesAtClose !== null || now < Date.parse(r.endsAt)) return p;
    changed = true;
    const photo = latestSubmission(p);
    const eligible =
      photo?.status === 'APPROVED' &&
      (!photo.reviewedAt || Date.parse(photo.reviewedAt) < Date.parse(r.endsAt));
    return { ...p, likesAtClose: eligible ? p.liveLikes : 0 };
  });
  return changed ? { ...state, participations } : state;
}
export function selectWinner(
  state: AdminEventState,
  id: string,
  selected: boolean,
  now: number
): AdminEventState {
  const p = state.participations.find((p) => p.id === id);
  const r = state.rounds.find((r) => r.id === p?.roundId);
  if (
    !p ||
    !r ||
    now < Date.parse(r.endsAt) ||
    latestSubmission(p)?.status !== 'APPROVED' ||
    p.likesAtClose === null ||
    p.specialDelivery !== 'PENDING'
  )
    throw new Error('종료 후 승인된 미지급 후보만 선택할 수 있습니다.');
  if (selected) {
    if (p.reported && !p.reportResolved) throw new Error('신고 최종 검수를 완료해 주세요.');
    const candidates = state.participations.filter(
      (other) =>
        other.roundId === r.id &&
        other.missionId === p.missionId &&
        latestSubmission(other)?.status === 'APPROVED' &&
        other.likesAtClose !== null &&
        (!other.reported || other.reportResolved)
    );
    if (
      candidates.filter((other) => (other.likesAtClose ?? 0) > (p.likesAtClose ?? 0)).length >=
      r.topN
    )
      throw new Error('좋아요 Top N 범위의 후보를 선택해 주세요.');
    if (candidates.filter((other) => other.id !== id && other.topWinner).length >= r.topN)
      throw new Error('해당 구역의 Top N 인원을 초과했습니다.');
  }
  return {
    ...state,
    participations: state.participations.map((item) =>
      item.id === id ? { ...item, topWinner: selected } : item
    ),
  };
}
export function advanceReward(
  state: AdminEventState,
  ids: string[],
  now: number,
  special = false
): AdminEventState {
  if (!ids.length) throw new Error('대상자를 선택해 주세요.');
  const next: Record<RewardDelivery, RewardDelivery> = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'EMAILED',
    EMAILED: 'COLLECTED',
    COLLECTED: 'SENT',
    SENT: 'SENT',
  };
  for (const id of ids) {
    const p = state.participations.find((p) => p.id === id);
    if (
      !p ||
      latestSubmission(p)?.status !== 'APPROVED' ||
      (p.reported && !p.reportResolved) ||
      !p.rewardAt ||
      !Number.isFinite(Date.parse(p.rewardAt)) ||
      Date.parse(p.rewardAt) > now ||
      (special ? p.specialDelivery : p.delivery) === 'SENT'
    )
      throw new Error('승인·신고 검수·지급 일정이 충족된 미완료 대상만 처리할 수 있습니다.');
    if (special && !p.topWinner) throw new Error('특별 보상은 최종 수상자만 확정할 수 있습니다.');
  }
  if (
    new Set(
      ids.map((id) => {
        const p = state.participations.find((p) => p.id === id);
        return special ? p?.specialDelivery : p?.delivery;
      })
    ).size > 1
  )
    throw new Error('같은 지급 상태의 대상자를 선택해 주세요.');
  return {
    ...state,
    participations: state.participations.map((p) => {
      if (!ids.includes(p.id)) return p;
      const r = state.rounds.find((r) => r.id === p.roundId);
      if (special)
        return {
          ...p,
          specialDelivery: next[p.specialDelivery],
          specialRewardSnapshot: p.specialRewardSnapshot ?? r?.specialReward ?? '',
        };
      return {
        ...p,
        delivery: p.delivery === 'PENDING' ? 'CONFIRMED' : 'SENT',
        rewardSnapshot: p.rewardSnapshot ?? {
          ...p.baseReward,
          specialReward: '',
        },
      };
    }),
  };
}
