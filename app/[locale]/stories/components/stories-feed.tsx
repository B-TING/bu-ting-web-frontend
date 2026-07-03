import { ArrowLeft, BookOpenText, PenLine } from 'lucide-react';
import Link from 'next/link';

import { StoryCard } from '@/app/[locale]/stories/components/story-card';
import { STORIES } from '@/app/[locale]/stories/data';

export function StoriesFeed() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto min-h-screen max-w-5xl bg-white shadow-sm">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Link
              href="/"
              aria-label="홈으로 돌아가기"
              className="flex size-10 items-center justify-center rounded-full text-sky-700 hover:bg-sky-50"
            >
              <ArrowLeft className="size-6" />
            </Link>
            <BookOpenText className="size-5 text-sky-700" />
            <h1 className="text-xl font-black text-slate-950">여행기</h1>
            <Link
              href="/stories/new"
              className="ml-auto flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
            >
              <PenLine className="size-4" />
              <span className="hidden sm:inline">여행기 쓰기</span>
            </Link>
          </div>
        </header>

        <section className="bg-gradient-to-br from-sky-700 to-cyan-500 px-6 py-10 text-white sm:px-10">
          <p className="text-xs font-black tracking-[0.2em] text-sky-100">BUSAN TRAVELOGUE</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">부산에서 만난 순간들</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-sky-50">
            다른 여행자의 동선을 살펴보고, 마음에 드는 계획은 내 일정으로 가져와 보세요.
          </p>
        </section>

        <section className="grid gap-6 p-4 sm:grid-cols-2 sm:p-8" aria-label="여행기 목록">
          {STORIES.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </section>
      </div>
    </main>
  );
}
