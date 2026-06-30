'use client';

import { ArrowLeft, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { FestivalCard } from '@/app/festivals/components/festival-card';
import { FESTIVALS } from '@/app/festivals/data';

function isFestivalInMonth(
  startDate: string,
  endDate: string,
  year: number,
  month: number,
) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
  return start <= monthEnd && end >= monthStart;
}

export function FestivalCalendar() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 5, 1));
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const festivals = useMemo(
    () => FESTIVALS.filter((festival) => isFestivalInMonth(festival.startDate, festival.endDate, year, month)),
    [month, year],
  );

  const moveMonth = (amount: number) => {
    setVisibleMonth(new Date(year, month + amount, 1));
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="홈으로 돌아가기" className="flex size-10 items-center justify-center rounded-full text-sky-700 hover:bg-sky-50">
            <ArrowLeft className="size-6" />
          </Link>
          <PartyPopper className="size-5 text-sky-700" />
          <h1 className="text-xl font-black text-slate-950">축제 캘린더</h1>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
          <button type="button" aria-label="이전 달" onClick={() => moveMonth(-1)} className="flex size-10 items-center justify-center rounded-full text-sky-700 hover:bg-sky-50">
            <ChevronLeft className="size-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-950">{year}년 {month + 1}월 축제</h2>
            <p className="mt-1 text-xs text-slate-500">{festivals.length}개 축제</p>
          </div>
          <button type="button" aria-label="다음 달" onClick={() => moveMonth(1)} className="flex size-10 items-center justify-center rounded-full text-sky-700 hover:bg-sky-50">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        {festivals.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {festivals.map((festival) => <FestivalCard key={festival.id} festival={festival} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <PartyPopper className="mx-auto size-10 text-slate-300" />
            <p className="mt-4 font-bold text-slate-700">등록된 축제가 없어요.</p>
            <p className="mt-2 text-sm text-slate-400">다른 달의 축제를 확인해 보세요.</p>
          </div>
        )}
        <p className="mt-8 text-center text-xs text-slate-400">축제 API 연동 전 목업 데이터입니다.</p>
      </div>
    </main>
  );
}
