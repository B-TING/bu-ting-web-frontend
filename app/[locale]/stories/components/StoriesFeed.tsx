'use client';

import { ArrowLeft, LayoutGrid, LoaderCircle, Rows3 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { StoryCard } from '@/app/[locale]/stories/components/StoryCard';
import { useTravelRecordFeed } from '@/app/[locale]/stories/hooks/use-travel-records';
import { feedRecordToStory } from '@/app/[locale]/stories/travel-record-adapter';

type FeedColumnCount = 1 | 2 | 3;

const VIEW_OPTIONS: Array<{ value: FeedColumnCount; label: string }> = [
  { value: 1, label: '1개씩 보기' },
  { value: 2, label: '2개씩 보기' },
  { value: 3, label: '3개씩 보기' },
];

function getGridClass(columnCount: FeedColumnCount) {
  if (columnCount === 1) {
    return 'grid-cols-1';
  }

  if (columnCount === 2) {
    return 'grid-cols-1 xl:grid-cols-2';
  }

  return 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3';
}

export function StoriesFeed() {
  const [columnCount, setColumnCount] = useState<FeedColumnCount>(1);
  const feed = useTravelRecordFeed();
  const records = feed.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              aria-label="메인으로 돌아가기"
              className="flex size-10 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-50"
            >
              <ArrowLeft className="size-5" />
            </Link>

            <div>
              <p className="text-sm font-semibold text-sky-700">Travel Stories</p>
              <h1 className="text-3xl font-black text-slate-950">여행기</h1>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">관광지 후기 모아보기</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                여행자들이 방문한 장소 후기를 한 화면에서 편하게 둘러보세요.
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                공개된 여행기에서 장소별 후기와 평점을 모아 보고, 상세 페이지에서는 이동 동선과
                댓글까지 이어서 확인할 수 있어요.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {VIEW_OPTIONS.map((option) => {
                const isActive = option.value === columnCount;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColumnCount(option.value)}
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'border-sky-700 bg-sky-700 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700',
                    ].join(' ')}
                  >
                    {option.value === 1 ? (
                      <Rows3 className="size-4" />
                    ) : (
                      <LayoutGrid className="size-4" />
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {feed.isLoading ? (
          <LoaderCircle className="mx-auto mt-16 size-8 animate-spin text-sky-700" />
        ) : feed.isError ? (
          <div className="mt-10 rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">여행기 피드를 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => void feed.refetch()}
              className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-600"
            >
              다시 시도
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            공개된 여행기가 아직 없어요.
          </div>
        ) : (
          <>
            <div className={['mt-6 grid gap-6', getGridClass(columnCount)].join(' ')}>
              {records.map((record) => (
                <StoryCard
                  key={record.travelRecordId}
                  story={feedRecordToStory(record)}
                  initialLiked={record.likedByMe}
                  compact={columnCount !== 1}
                />
              ))}
            </div>
            {feed.hasNextPage ? (
              <button
                type="button"
                onClick={() => void feed.fetchNextPage()}
                disabled={feed.isFetchingNextPage}
                className="mx-auto mt-8 flex h-11 items-center rounded-xl bg-sky-700 px-6 text-sm font-semibold text-white disabled:opacity-60"
              >
                {feed.isFetchingNextPage ? '불러오는 중...' : '여행기 더 보기'}
              </button>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
