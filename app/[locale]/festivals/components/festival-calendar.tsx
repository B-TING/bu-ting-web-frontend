import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { FestivalCard } from '@/app/[locale]/festivals/components/festival-card';
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
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6">
          <Link
            href="/"
            aria-label={'\uBA54\uC778\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30'}
            className="flex size-10 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-50"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-sky-700">축제 디렉토리</p>
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
              {'\uBD80\uC0B0 \uCD95\uC81C \uC815\uBCF4'}
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {'\uC6D4\uBCC4 \uCD95\uC81C \uB458\uB7EC\uBCF4\uAE30'}
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{monthLabel}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {'\uCD1D '}
              <span className="font-bold text-slate-900">{festivals.length}</span>
              {'\uAC1C\uC758 \uCD95\uC81C\uAC00 \uC870\uD68C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/festivals?month=${previousMonth}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              <ChevronLeft className="size-4" />
              {'\uC774\uC804 \uB2EC'}
            </Link>
            <Link
              href={`/festivals?month=${nextMonth}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              {'\uB2E4\uC74C \uB2EC'}
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>

        {festivals.length > 0 ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {festivals.map((festival) => (
              <FestivalCard
                key={festival.contentId}
                festival={festival}
                month={currentMonth}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <p className="text-lg font-black text-slate-800">
              {'\uC774\uBC88 \uB2EC\uC5D0 \uC870\uD68C\uB41C \uCD95\uC81C\uAC00 \uC5C6\uC5B4\uC694.'}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {
                '\uC774\uC804 \uB2EC\uC774\uB098 \uB2E4\uC74C \uB2EC\uB85C \uC774\uB3D9\uD574\uC11C \uB2E4\uB978 \uD589\uC0AC \uC815\uBCF4\uB97C \uD655\uC778\uD574 \uBCF4\uC138\uC694.'
              }
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
