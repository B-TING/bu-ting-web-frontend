import type { AdminEventState } from '../types/event-admin';

// Synthetic fixtures only. Never use this adapter for real participant information.
export function createEventAdminDemo(now = Date.now()): AdminEventState {
  const iso = (hours: number) => new Date(now + hours * 3600000).toISOString();
  const zones = [
    'HAEUNDAE_GIJANG',
    'SUYEONG_NAMGU',
    'CENTRAL_NORTH',
    'OLD_DOWNTOWN',
    'YEONGDO',
    'WESTERN_BUSAN',
  ] as const;
  const names = [
    '해운대 바다를 담아주세요',
    '광안대교와 함께하는 순간',
    '전포 골목의 작은 발견',
    '남포에서 찾은 부산의 색',
    '흰여울 바다 산책',
    '다대포의 빛을 담다',
  ];
  const places = [
    ['해운대 해수욕장', '송정 해수욕장'],
    ['민락수변공원', '광안리 해수욕장'],
    ['전포 카페거리', '서면 문화로'],
    ['용두산공원', '국제시장'],
    ['흰여울문화마을', '태종대'],
    ['다대포 해수욕장', '감천문화마을'],
  ];
  const coords = [
    [35.1587, 129.1604],
    [35.153, 129.124],
    [35.157, 129.063],
    [35.1006, 129.0325],
    [35.078, 129.044],
    [35.046, 128.966],
  ];
  const missions = zones.map((zoneId, i) => ({
    id: `mission-${i}`,
    zoneId,
    title: names[i],
    condition: '선택 장소의 풍경과 본인의 손이 함께 보이도록 현장에서 촬영해 주세요.',
    kind: 'PLACE_AUTH' as const,
    places: places[i].map((name, j) => ({
      id: `place-${i}-${j}`,
      placeContentId: '',
      contentTypeId: '',
      sourceLatitude: null,
      sourceLongitude: null,
      name,
      latitude: coords[i][0] + j * 0.001,
      longitude: coords[i][1] + j * 0.001,
      radius: 100,
    })),
    exampleImage: '',
    points: 50,
    badge: `SPOT_${zoneId}`,
  }));
  const rounds = [
    {
      id: 'round-live',
      name: '부산의 장면을 모으는 하루',
      startsAt: iso(-3),
      endsAt: iso(21),
      missionIds: ['mission-0', 'mission-1', 'mission-4', 'mission-5'],
      cancelled: false,
      cancelledMissionIds: [],
      topN: 2,
      specialReward: '지역 카페 음료 교환권',
    },
    {
      id: 'round-closed',
      name: '골목과 바다, 지난 부산 여행',
      startsAt: iso(-48),
      endsAt: iso(-24),
      missionIds: ['mission-0', 'mission-1', 'mission-2', 'mission-3'],
      cancelled: false,
      cancelledMissionIds: [],
      topN: 2,
      specialReward: '운영자 선정 부산 로컬 기프트',
    },
  ];
  return {
    version: 1,
    missions,
    rounds,
    participations: Array.from({ length: 8 }, (_, i) => {
      const m = missions[i < 3 ? [0, 1, 4][i] : 1];
      const p = m.places[0];
      return {
        id: `participation-${i}`,
        userId: `demo-user-${i}`,
        nickname: [
          '바다산책',
          '부산수집가',
          '여행하는봄',
          '광안러버',
          '오늘도부산',
          '골목탐험가',
          '파도소리',
          '부산한장',
        ][i],
        roundId: i < 3 ? 'round-live' : 'round-closed',
        missionId: m.id,
        submissions: [
          {
            id: `photo-${i}`,
            targetId: p.id,
            placeContentId: p.placeContentId,
            placeName: p.name,
            submittedAt: iso(i < 3 ? -1 : -26),
            image: '',
            latitude: p.latitude,
            longitude: p.longitude,
            targetLatitude: p.latitude,
            targetLongitude: p.longitude,
            radius: p.radius,
            condition: m.condition,
            status: i < 3 ? 'PENDING' : 'APPROVED',
            reason: '',
          },
        ],
        liveLikes: i < 3 ? 0 : [45, 32, 32, 12, 8][i - 3],
        likesAtClose: i < 3 ? null : [45, 32, 32, 12, 8][i - 3],
        baseReward: { points: m.points, badge: m.badge },
        reported: i === 6,
        reportReason: i === 6 ? '다른 사용자의 사진과 유사하다는 신고 (샘플)' : '',
        reportResolved: false,
        rewardAt: iso(-1),
        delivery: 'PENDING',
        specialDelivery: 'PENDING',
        topWinner: false,
      };
    }),
    titles: zones.map((zoneId) => ({
      zoneId,
      names: ['발자국', '러버', '마스터'],
      thresholds: [1, 3, 7],
    })),
    audits: [],
  };
}
