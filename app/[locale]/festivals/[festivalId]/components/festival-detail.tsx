'use client';

import { ArrowLeft, CalendarDays, Clock3, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { FestivalCommentSheet } from '@/app/[locale]/festivals/[festivalId]/components/festival-comment-sheet';
import { FestivalLocationMap } from '@/app/[locale]/festivals/[festivalId]/components/festival-location-map';
import type { Festival } from '@/app/[locale]/festivals/types';

const CATEGORY_LABEL = {
  festival: 'FESTIVAL',
  exhibition: 'EXHIBITION',
} as const;

const STATUS_LABEL = {
  ongoing: null,
  'coming-soon': 'COMING SOON',
  ended: '종료된 행사입니다',
} as const;

function formatDate(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return `${value.getMonth() + 1}.${value.getDate()}`;
}

export function FestivalDetail({ festival }: { festival: Festival }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const statusLabel = STATUS_LABEL[festival.status];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Link href="/festivals" aria-label="축제 목록으로 돌아가기" className="flex size-10 items-center justify-center rounded-full text-sky-700 hover:bg-sky-50">
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-xl font-black text-slate-950">축제 상세</h1>
        </div>
      </header>

      <div className="mx-auto max-w-4xl bg-white shadow-sm">
        <FestivalLocationMap festival={festival} />

        <section className="relative min-h-[480px] overflow-hidden bg-slate-900" style={{ backgroundImage: `linear-gradient(to top, rgba(15,23,42,.98), rgba(15,23,42,.12) 76%), url(${festival.imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-md px-2.5 py-1 text-[11px] font-black ${festival.category === 'festival' ? 'bg-sky-600' : 'bg-orange-500'}`}>{CATEGORY_LABEL[festival.category]}</span>
              {statusLabel ? (
                <span className={`rounded-md px-2.5 py-1 text-[11px] font-black ${festival.status === 'coming-soon' ? 'bg-violet-600' : 'bg-slate-500'}`}>{statusLabel}</span>
              ) : null}
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{festival.title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">{festival.description}</p>

            <dl className="mt-6 grid gap-3 border-t border-white/20 pt-5 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-sky-300" /><div><dt className="text-xs text-slate-400">장소</dt><dd className="mt-1 font-semibold">{festival.address}</dd></div></div>
              <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-sky-300" /><div><dt className="text-xs text-slate-400">기간</dt><dd className="mt-1 font-semibold">{formatDate(festival.startDate)} - {formatDate(festival.endDate)}</dd></div></div>
              <div className="flex items-start gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-sky-300" /><div><dt className="text-xs text-slate-400">운영 시간</dt><dd className="mt-1 font-semibold">{festival.operatingHours}</dd></div></div>
            </dl>

            <button type="button" aria-label="코멘트 열기" onClick={() => setCommentsOpen(true)} className="mt-6 ml-auto flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/25">
              <MessageCircle className="size-4" /> {festival.commentCount}
            </button>
          </div>
        </section>
      </div>

      {commentsOpen ? <FestivalCommentSheet onClose={() => setCommentsOpen(false)} /> : null}
    </main>
  );
}
