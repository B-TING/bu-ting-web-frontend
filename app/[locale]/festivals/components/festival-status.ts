import type { FestivalSummary } from '@/types/festival';

export type FestivalStatus = 'ongoing' | 'upcoming' | 'ended';

interface FestivalStatusMeta {
  label: string;
  className: string;
  order: number;
}

const FESTIVAL_STATUS_META: Record<FestivalStatus, FestivalStatusMeta> = {
  ongoing: {
    label: '진행중',
    className: 'border-emerald-500 text-emerald-600',
    order: 0,
  },
  upcoming: {
    label: '진행예정',
    className: 'border-slate-300 text-slate-500',
    order: 1,
  },
  ended: {
    label: '종료됨',
    className: 'border-rose-500 text-rose-600',
    order: 2,
  },
};

function parseFestivalDate(value: string) {
  return new Date(
    Number(value.slice(0, 4)),
    Number(value.slice(4, 6)) - 1,
    Number(value.slice(6, 8)),
    0,
    0,
    0,
    0,
  );
}

export function getFestivalStatus(festival: FestivalSummary): FestivalStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = parseFestivalDate(festival.eventStartDate);
  const endDate = parseFestivalDate(festival.eventEndDate);

  if (today < startDate) {
    return 'upcoming';
  }

  if (today > endDate) {
    return 'ended';
  }

  return 'ongoing';
}

export function getFestivalStatusMeta(status: FestivalStatus) {
  return FESTIVAL_STATUS_META[status];
}
