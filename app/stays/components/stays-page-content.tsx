'use client';

import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { StayCardList } from '@/app/stays/components/stay-card-list';
import { StayDetailSheet } from '@/app/stays/components/stay-detail-sheet';
import { StayMap } from '@/app/stays/components/stay-map';
import { STAYS } from '@/app/stays/data';
import type { Stay } from '@/app/stays/types';

const BOOKMARK_STORAGE_KEY = 'buting-stay-bookmarks';

export function StaysPageContent() {
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
        if (saved) setBookmarkedIds(JSON.parse(saved) as string[]);
      } catch {
        window.localStorage.removeItem(BOOKMARK_STORAGE_KEY);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const sortedStays = useMemo(
    () =>
      [...STAYS].sort((a, b) => {
        const aBookmarked = bookmarkedIds.includes(a.id) ? 1 : 0;
        const bBookmarked = bookmarkedIds.includes(b.id) ? 1 : 0;
        return bBookmarked - aBookmarked;
      }),
    [bookmarkedIds],
  );

  const selectStay = (stay: Stay) => {
    setSelectedStay(stay);
    setDetailOpen(true);
  };

  const toggleBookmark = (stayId: string) => {
    const nextBookmarkedIds = bookmarkedIds.includes(stayId)
      ? bookmarkedIds.filter((id) => id !== stayId)
      : [...bookmarkedIds, stayId];

    setBookmarkedIds(nextBookmarkedIds);
    window.localStorage.setItem(
      BOOKMARK_STORAGE_KEY,
      JSON.stringify(nextBookmarkedIds),
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col bg-white shadow-sm">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Link
              href="/"
              aria-label="홈으로 돌아가기"
              className="flex size-10 items-center justify-center rounded-full text-sky-700 hover:bg-sky-50"
            >
              <ArrowLeft className="size-6" />
            </Link>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-sky-700" />
              <h1 className="text-xl font-black text-slate-950">부산 숙소</h1>
            </div>
          </div>
          <div className="px-5 pb-4 sm:px-7">
            <p className="text-sm font-bold text-slate-800">4개 권역 · 숙소 5곳</p>
            <p className="mt-1 text-xs text-slate-500">
              평점과 리뷰는 Google Maps API 연동 예정입니다.
            </p>
          </div>
        </header>

        <StayMap
          stays={sortedStays}
          selectedStayId={selectedStay?.id ?? null}
          onSelect={selectStay}
        />

        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-bold text-slate-800">카카오맵 스타일 지도</p>
          <p className="mt-1 text-[11px] text-slate-500">부산 주요 숙소 위치</p>
        </div>

        <StayCardList
          stays={sortedStays}
          selectedStayId={selectedStay?.id ?? null}
          bookmarkedIds={bookmarkedIds}
          onSelect={selectStay}
          onToggleBookmark={toggleBookmark}
        />
      </div>

      {selectedStay && detailOpen ? (
        <StayDetailSheet
          stay={selectedStay}
          bookmarked={bookmarkedIds.includes(selectedStay.id)}
          onToggleBookmark={() => toggleBookmark(selectedStay.id)}
          onClose={() => setDetailOpen(false)}
        />
      ) : null}
    </main>
  );
}
