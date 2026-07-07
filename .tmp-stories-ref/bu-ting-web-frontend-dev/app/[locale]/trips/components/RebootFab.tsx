'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface RebootFabProps {
  tripId: string;
  // itinerary 페이지처럼 이미 일정 화면 위에 있는 경우 페이지 이동 없이 바로 모달을 연다.
  // 그 외 페이지에서는 itinerary 페이지로 이동한 뒤 모달이 자동으로 열린다.
  onOpen?: () => void;
}

const FAB_CLASSNAME =
  'fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-300/50 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95';

function RebootIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0114.5-3.5M19.5 15a8 8 0 01-14.5 3.5" />
    </svg>
  );
}

export function RebootFab({ tripId, onOpen }: RebootFabProps) {
  const t = useTranslations('trip.reboot');

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={FAB_CLASSNAME}>
        <RebootIcon />
        {t('fabLabel')}
      </button>
    );
  }

  return (
    <Link href={`/trips/${tripId}/itinerary?reboot=1`} className={FAB_CLASSNAME}>
      <RebootIcon />
      {t('fabLabel')}
    </Link>
  );
}
