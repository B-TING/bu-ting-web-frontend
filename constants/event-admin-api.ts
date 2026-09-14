import type {
  AdminField,
  AdminOperation,
  AdminRecord,
  AdminResource,
} from '@/types/event-admin-api';
import { ADMIN_EVENT_ZONES } from './event-admin';
export const textField = (key: string, label: string, required = false): AdminField => ({
  key,
  label,
  required,
});
export const numberField = (key: string, label: string, min = 0, max?: number): AdminField => ({
  key,
  label,
  type: 'number',
  min,
  max,
});
export const timeField = (key: string, label: string, required = false): AdminField => ({
  key,
  label,
  type: 'datetime-local',
  required,
});
const choices = (...values: string[]) => values.map((value) => ({ value, label: value }));
export const zoneField: AdminField = {
  key: 'zoneId',
  label: '구역',
  required: true,
  options: ADMIN_EVENT_ZONES.map((z) => ({ value: z.id, label: z.name })),
};
const reason = textField('reason', '변경·반려 사유', true);
const note = textField('note', '처리 사유', true);
const rewardFields = (prefix: string): AdminField[] => [
  numberField(`${prefix}.points`, '포인트'),
  textField(`${prefix}.badgeCode`, '배지 코드'),
  numberField(`${prefix}.topN`, '특별 보상 인원'),
  textField(`${prefix}.prizeRewardCode`, '상품 보상 코드'),
];
export const targetFields: AdminField[] = [
  textField('guideText', '통과 조건 · 촬영 안내', true),
  { key: 'exampleFileKey', label: '예시 이미지', type: 'file' },
  { ...numberField('latitude', '위도', -90, 90), required: true },
  { ...numberField('longitude', '경도', -180, 180), required: true },
  { ...numberField('radiusM', '허용 반경 (m)', 30, 500), required: true, value: '100' },
];
const dates = [timeField('from', '조회 시작'), timeField('to', '조회 종료')];
const status = textField('status', '상태');
const roundId = textField('roundId', '회차 ID');
const eventId = textField('eventId', '미션 ID');
export const adminResources: AdminResource[] = [
  {
    key: 'rounds',
    label: '로테이션 관리',
    path: '/admin/zone-event-rounds',
    id: 'roundId',
    columns: ['roundNo', 'name', 'status', 'startsAt', 'endsAt'],
    filters: [status, textField('keyword', '검색어'), ...dates],
    create: {
      label: '로테이션 만들기',
      path: '/admin/zone-event-rounds',
      method: 'POST',
      fields: [
        { ...numberField('roundNo', '회차 번호', 1), required: true },
        textField('name', '회차 이름', true),
        {
          key: 'roundType',
          label: '회차 종류',
          options: choices('REGULAR', 'GUERRILLA'),
          value: 'REGULAR',
        },
        timeField('startsAt', '시작 시각 (한국 시간)', true),
        timeField('endsAt', '종료 시각 (한국 시간)', true),
        ...rewardFields('excellenceReward'),
      ],
      fixed: { timezone: 'Asia/Seoul' },
    },
  },
  {
    key: 'events',
    label: '미션 관리',
    path: '/admin/zone-events',
    id: 'eventId',
    columns: ['title', 'zoneId', 'status', 'startsAt', 'endsAt', 'successCount'],
    filters: [roundId, { ...zoneField, key: 'zone', required: false }, status, ...dates],
    create: {
      label: '미션 만들기',
      path: '/admin/zone-events',
      method: 'POST',
      fields: [
        { ...roundId, required: true },
        zoneField,
        {
          key: 'typeCode',
          label: '인증 유형',
          options: choices('PLACE_AUTH', 'OBJECT_AUTH'),
          value: 'PLACE_AUTH',
        },
        textField('title', '미션 제목', true),
        textField('description', '미션 설명'),
        textField('authTarget.landmarkId', '랜드마크 식별자 (사물 인증 시 필수)'),
        timeField('startsAt', '시작 시각 (한국 시간)', true),
        { ...numberField('durationMinutes', '운영 시간 (분)', 1), required: true },
        ...rewardFields('baseReward'),
        ...rewardFields('excellenceReward'),
        ...targetFields.map((f) => ({ ...f, key: `authTarget.${f.key}` })),
      ],
      fixed: {
        successLimitPerUser: 1,
        baseReward: { points: 0 },
        authTarget: { targetKind: 'PLACE' },
      },
      placePrefix: 'authTarget',
      placeRequired: true,
      description:
        '초안 회차를 선택하고 구역당 미션 하나를 생성합니다. 선택 장소는 생성 후 추가할 수 있습니다.',
    },
  },
  {
    key: 'reviews',
    label: '사진 인증 검수',
    path: '/admin/zone-event-reviews',
    id: 'participationId',
    columns: ['participationId', 'zoneId', 'userId', 'joinedAt'],
    filters: [roundId, eventId, { ...zoneField, required: false }],
  },
  {
    key: 'participations',
    label: '전체 참여',
    path: '/admin/zone-event-participations',
    id: 'participationId',
    columns: ['participationId', 'zoneId', 'status', 'hidden', 'joinedAt'],
    filters: [
      roundId,
      eventId,
      { ...zoneField, required: false },
      textField('userId', '사용자 ID'),
      status,
      textField('keyword', '검색어'),
    ],
  },
  {
    key: 'reports',
    label: '신고 관리',
    path: '/admin/zone-event-reports',
    id: 'reportId',
    columns: ['reportId', 'reasonCode', 'status', 'createdAt'],
    filters: [roundId, eventId, status, textField('participationId', '참여 ID')],
  },
  {
    key: 'payouts',
    label: '보상·정산 관리',
    path: '/admin/reward-payouts',
    id: 'payoutId',
    columns: ['payoutType', 'participationId', 'status', 'holdStatus', 'scheduledAt'],
    filters: [
      roundId,
      eventId,
      status,
      { key: 'rewardReason', label: '보상 종류', options: choices('BASE', 'TOP_LIKE') },
      textField('holdStatus', '보류 상태'),
      timeField('scheduledFrom', '지급 예정 시작'),
      timeField('scheduledTo', '지급 예정 종료'),
    ],
  },
  {
    key: 'catalog',
    label: '보상 상품',
    path: '/admin/reward-catalog',
    id: 'rewardId',
    columns: ['name', 'code', 'rewardType', 'stock', 'active'],
    filters: [
      textField('rewardType', '보상 유형'),
      { key: 'active', label: '활성 여부', options: choices('true', 'false') },
    ],
    create: {
      label: '보상 상품 등록',
      path: '/admin/reward-catalog',
      method: 'POST',
      fields: [
        {
          key: 'rewardType',
          label: '보상 유형',
          required: true,
          options: choices('POINT', 'BADGE', 'COUPON', 'GIFTICON'),
        },
        textField('code', '상품 코드', true),
        textField('name', '상품 이름', true),
        numberField('pointAmount', '포인트'),
        { key: 'imageFileKey', label: '상품 이미지', type: 'file' },
        numberField('stock', '재고'),
        numberField('monthlyCap', '월 한도'),
        numberField('validDays', '유효 일수'),
        { key: 'active', label: '활성화', type: 'checkbox', value: 'true' },
      ],
    },
  },
  {
    key: 'titles',
    label: '구역 칭호',
    path: '/admin/zone-titles',
    id: 'titleDefId',
    columns: ['titleName', 'zoneId', 'tier', 'requiredSuccessCount', 'holderCount'],
    filters: [],
    create: {
      label: '칭호 등록',
      path: '/admin/zone-titles',
      method: 'POST',
      fields: [
        zoneField,
        { ...numberField('tier', '단계', 1, 3), required: true },
        { ...numberField('requiredSuccessCount', '필요 성공 횟수', 1), required: true },
        textField('titleName', '칭호 이름', true),
        textField('style', '스타일', true),
        textField('color', '색상', true),
      ],
    },
  },
  {
    key: 'stats',
    label: '운영 통계',
    path: '/admin/zone-event-stats',
    id: 'slotId',
    columns: [
      'zoneId',
      'joinedCount',
      'successCount',
      'pendingReviewCount',
      'openReportCount',
      'basePaidCount',
      'specialSentCount',
    ],
    filters: [roundId, ...dates],
  },
  {
    key: 'audits',
    label: '운영 이력',
    path: '/admin/zone-event-audits',
    id: 'auditId',
    columns: ['action', 'targetType', 'actorId', 'createdAt'],
    filters: [
      textField('resourceType', '대상 종류'),
      textField('resourceId', '대상 ID'),
      textField('actorId', '운영자 ID'),
      ...dates,
    ],
  },
];

export function adminOperations(kind: string, row: AdminRecord, parent = ''): AdminOperation[] {
  const id = String(row[adminResources.find((r) => r.key === kind)?.id ?? 'targetId'] ?? '');
  const path = `${adminResources.find((r) => r.key === kind)?.path ?? parent}/${encodeURIComponent(id)}`;
  const revision = { expectedRevision: row.revision };
  const op = (
    label: string,
    suffix: string,
    fields: AdminField[] = [],
    method: AdminOperation['method'] = 'POST',
    fixed: AdminRecord = {}
  ): AdminOperation => ({ label, path: path + suffix, method, fields, initial: row, fixed });
  if (kind === 'rounds')
    return [
      op(
        '일정 수정',
        '',
        [
          textField('name', '회차 이름'),
          timeField('startsAt', '시작 시각'),
          timeField('endsAt', '종료 시각'),
        ],
        'PATCH',
        revision
      ),
      op('운영 예약 확정', '/schedule'),
      op('긴급 취소', '/cancel', [reason], 'POST', revision),
      op('예비 장소 등록', '/backup-targets', targetFields, 'POST', { targetKind: 'PLACE' }),
      op('예비 장소로 교체', '/swap-target', [
        textField('eventId', '미션 ID', true),
        textField('backupTargetId', '예비 장소 ID', true),
      ]),
      op('회차 정산', '/settle'),
    ].map((o) =>
      o.label === '예비 장소 등록' ? { ...o, placePrefix: '', placeRequired: true } : o
    );
  if (kind === 'events')
    return [
      op(
        '미션 수정',
        '',
        [
          textField('title', '미션 제목'),
          textField('description', '설명'),
          numberField('durationMinutes', '운영 시간 (분)', 1),
          ...rewardFields('excellenceReward'),
          ...(row.status === 'SCHEDULED'
            ? [zoneField, timeField('startsAt', '시작 시각'), ...rewardFields('baseReward')]
            : []),
          reason,
        ],
        'PATCH',
        revision
      ),
      op('미션 취소', '/cancel'),
      {
        ...op(
          '선택 장소 추가',
          '/targets',
          row.typeCode === 'OBJECT_AUTH'
            ? [textField('landmarkId', '랜드마크 식별자', true), ...targetFields]
            : targetFields,
          'POST',
          { targetKind: row.typeCode === 'OBJECT_AUTH' ? 'OBJECT' : 'PLACE' }
        ),
        placePrefix: '',
        placeRequired: true,
      },
      op('지급 후보 생성', '/payouts/generate'),
    ];
  if (kind === 'targets')
    return [
      op('좌표·안내 수정', '', [...targetFields, reason], 'PATCH', revision),
      {
        ...op('장소 긴급 교체', '/replace', [...targetFields, reason]),
        placePrefix: '',
        placeRequired: true,
      },
      op('장소 취소', '/cancel'),
      ...(typeof row.sourceLatitude === 'number' && typeof row.sourceLongitude === 'number'
        ? [
            op('원본 좌표로 복원', '', [reason], 'PATCH', {
              ...revision,
              latitude: row.sourceLatitude,
              longitude: row.sourceLongitude,
            }),
          ]
        : []),
    ];
  if (kind === 'reviews' || kind === 'participations') {
    const s = row.currentSubmission;
    const result: AdminOperation[] = [];
    if (s && typeof s === 'object' && !Array.isArray(s)) {
      const fixed = { submissionId: s.submissionId, expectedRevision: s.revision };
      result.push(
        {
          label: '사진 승인',
          path: `/admin/zone-event-reviews/${id}/approve`,
          method: 'POST',
          fixed,
          description: '사진 인증 성공을 승인합니다. 보상 지급은 별도로 확정합니다.',
        },
        {
          label: '사진 반려',
          path: `/admin/zone-event-reviews/${id}/reject`,
          method: 'POST',
          fields: [reason],
          fixed,
        }
      );
    }
    result.push(
      { label: '참여 회수', path: `/admin/zone-event-participations/${id}/revoke`, method: 'POST' },
      { label: '숨김 해제', path: `/admin/zone-event-participations/${id}/unhide`, method: 'POST' }
    );
    return result;
  }
  if (kind === 'reports')
    return [
      op('신고 인정 · 지급 보류', '/uphold', [note], 'POST', { ...revision, action: 'HOLD' }),
      op('신고 기각', '/dismiss', [note], 'POST', revision),
    ];
  if (kind === 'payouts')
    return [
      op(
        '지급 내용 수정',
        '',
        [
          ...rewardFields('reward'),
          textField('memo', '메모'),
          timeField('scheduledAt', '지급 예정 시각'),
        ],
        'PATCH',
        revision
      ),
      op('보류 해제', '/release-hold', [note], 'POST', revision),
      op('지급 재시도', '/retry', [note], 'POST', revision),
      ...(row.payoutType === 'TOP_LIKE'
        ? [
            {
              label: '메일 발송 기록',
              path: '/admin/reward-payouts/mark-mail-sent',
              method: 'POST' as const,
              fields: [timeField('at', '발송 시각', true), note],
              fixed: { ...revision, payoutId: id },
            },
            {
              label: '정보 수집 완료 기록',
              path: '/admin/reward-payouts/mark-info-collected',
              method: 'POST' as const,
              fields: [timeField('at', '수집 시각', true), note],
              fixed: { ...revision, payoutId: id },
            },
            {
              label: '실제 발송 완료 기록',
              path: '/admin/reward-payouts/mark-sent',
              method: 'POST' as const,
              fields: [
                timeField('sentAt', '실제 발송 시각', true),
                textField('reference', '배송 참조 번호'),
                note,
              ],
              fixed: { ...revision, payoutId: id },
            },
          ]
        : []),
    ];
  if (kind === 'catalog')
    return [
      op(
        '보상 상품 수정',
        '',
        [
          textField('name', '상품 이름'),
          numberField('stock', '재고'),
          numberField('monthlyCap', '월 한도'),
          { key: 'active', label: '활성화', type: 'checkbox' },
        ],
        'PATCH'
      ),
    ];
  if (kind === 'titles')
    return [
      op(
        '칭호 수정',
        '',
        [
          textField('titleName', '칭호 이름'),
          numberField('requiredSuccessCount', '필요 성공 횟수', 1),
          {
            key: 'retroactive',
            label: '기존 사용자에게 변경 기준 소급 적용',
            type: 'checkbox',
            value: 'false',
          },
        ],
        'PATCH',
        revision
      ),
      op('칭호 삭제', '', [], 'DELETE'),
    ];
  return [];
}

export const adminLabels: Record<string, string> = Object.fromEntries(
  [
    ...adminResources.flatMap((r) => [...r.filters, ...(r.create?.fields ?? [])]),
    ...targetFields,
  ].map((f) => [f.key, f.label])
);
Object.assign(adminLabels, {
  roundId: '회차 ID',
  eventId: '미션 ID',
  participationId: '참여 ID',
  payoutId: '지급 ID',
  titleDefId: '칭호 ID',
  targetId: '장소 ID',
  name: '이름',
  title: '미션 제목',
  status: '상태',
  startsAt: '시작',
  endsAt: '종료',
  zoneId: '구역',
  userId: '사용자',
  userNickname: '닉네임',
  userEmail: '이메일',
  joinedAt: '참여 시각',
  submittedAt: '제출 시각',
  createdAt: '생성 시각',
  revision: '버전',
  slots: '구역 구성',
  backups: '예비 장소',
  currentSubmission: '현재 제출',
  submissionHistory: '제출 이력',
  mediaUrl: '인증 사진',
  guideTextSnapshot: '제출 당시 통과 조건',
  gpsLat: '촬영 위도',
  gpsLng: '촬영 경도',
  reviewStatus: '검수 상태',
  rejectionReason: '반려 사유',
  reviewedAt: '검수 시각',
  payoutType: '보상 종류',
  holdStatus: '보류 상태',
  scheduledAt: '지급 예정',
  reward: '보상',
  baseReward: '기본 보상',
  excellenceReward: '특별 보상',
  points: '포인트',
  topN: '특별 보상 인원',
  prizeRewardCode: '상품 코드',
  badgeCode: '배지',
  holderCount: '보유 인원',
  joinedCount: '참여 수',
  successCount: '성공 수',
  pendingReviewCount: '검수 대기',
  openReportCount: '미처리 신고',
  basePaidCount: '기본 보상 지급',
  specialSentCount: '특별 보상 발송',
  action: '처리',
  targetType: '대상 종류',
  actorId: '운영자',
  likeCountAtClose: '마감 좋아요',
  rankN: '순위',
  finalized: '수상 확정',
  heldByReport: '신고 보류',
  sourceLatitude: '원본 위도',
  sourceLongitude: '원본 경도',
  coordinatesOverridden: '좌표 수정 여부',
  mailedAt: '메일 발송',
  informationCollectedAt: '정보 수집',
  sentAt: '실제 발송',
  paidAt: '지급 완료',
  confirmedAt: '확정 시각',
  failureCode: '실패 코드',
  successRate: '성공률',
  attemptNo: '제출 차수',
});
