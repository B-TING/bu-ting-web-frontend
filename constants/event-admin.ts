import type { EventZoneId } from '@/types/event-admin';

export const ADMIN_EVENT_ZONES: { id: EventZoneId; name: string; short: string }[] = [
  { id: 'HAEUNDAE_GIJANG', name: '해운대·기장', short: '해운' },
  { id: 'SUYEONG_NAMGU', name: '수영·남구', short: '광안' },
  { id: 'CENTRAL_NORTH', name: '금정·동래·연제·부산진', short: '중앙' },
  { id: 'OLD_DOWNTOWN', name: '서·중·동구', short: '원도심' },
  { id: 'YEONGDO', name: '영도', short: '영도' },
  { id: 'WESTERN_BUSAN', name: '강서·사상·사하·북구', short: '서부' },
];
export const EVENT_DELIVERY_LABELS = {
  PENDING: '확정 대기',
  CONFIRMED: '안내 대기',
  EMAILED: '정보 수집 대기',
  COLLECTED: '발송 대기',
  SENT: '발송 완료',
} as const;
