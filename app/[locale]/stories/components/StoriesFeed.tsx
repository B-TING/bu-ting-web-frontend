'use client';

import { ArrowLeft, LayoutGrid, Rows3 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { StoryCard } from '@/app/[locale]/stories/components/StoryCard';
import type { StoryFeedItem } from '@/app/[locale]/stories/story-data';

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

export function StoriesFeed({ stories }: { stories: StoryFeedItem[] }) {
  const [columnCount, setColumnCount] = useState<FeedColumnCount>(1);

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
                공개된 여행기에서 장소별 후기와 평점을 모아 보고, 상세 페이지에서는 이동 동선과 댓글까지
                이어서 확인할 수 있어요.
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
                    {option.value === 1 ? <Rows3 className="size-4" /> : <LayoutGrid className="size-4" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={['mt-6 grid gap-6', getGridClass(columnCount)].join(' ')}>
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} compact={columnCount !== 1} />
          ))}
        </div>
      </section>
    </main>
  );
}
