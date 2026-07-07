import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { FestivalCard } from '@/app/[locale]/festivals/components/festival-card';
import {
  getFestivalStatus,
  getFestivalStatusMeta,
} from '@/app/[locale]/festivals/components/festival-status';
import type { FestivalSummary } from '@/types/festival';

interface FestivalCalendarProps {
  festivals: FestivalSummary[];
  currentMonth: string;
  monthLabel: string;
  previousMonth: string;
  nextMonth: string;
}

export function FestivalCalendar({
  festivals,
  currentMonth,
  monthLabel,
  previousMonth,
  nextMonth,
}: FestivalCalendarProps) {
  const sortedFestivals = festivals
    .map((festival, index) => ({ festival, index }))
    .sort((left, right) => {
      const leftOrder = getFestivalStatusMeta(getFestivalStatus(left.festival)).order;
      const rightOrder = getFestivalStatusMeta(getFestivalStatus(right.festival)).order;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.index - right.index;
    })
    .map(({ festival }) => festival);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6">
          <Link
            href="/"
            aria-label="메인으로 돌아가기"
            className="flex size-10 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-50"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-sky-700">축제 둘러보기</p>
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">부산 축제 정보</h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-500">월별 축제 둘러보기</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{monthLabel}</h2>
            <p className="mt-2 text-sm text-slate-500">
              총 <span className="font-bold text-slate-900">{sortedFestivals.length}</span>개의
              축제가 조회되었습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/festivals?month=${previousMonth}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              <ChevronLeft className="size-4" />
              이전 달
            </Link>
            <Link
              href={`/festivals?month=${nextMonth}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              다음 달
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>

        {sortedFestivals.length > 0 ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedFestivals.map((festival) => (
              <FestivalCard
                key={festival.contentId}
                festival={festival}
                month={currentMonth}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <p className="text-lg font-black text-slate-800">이번 달에 조회된 축제가 없어요.</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              이전 달이나 다음 달로 이동해서 다른 행사 정보를 확인해 보세요.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
