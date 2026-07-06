import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { STORY_ITEMS } from '../story-data';
import StoryFeedCard from './StoryFeedCard';

export default function StoriesFeed() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-start gap-4 px-6 py-10 lg:px-10">
          <Link
            href="/"
            className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
            aria-label="홈으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-sky-700">Place Review Feed</p>
            <h1 className="mt-2 text-4xl font-black text-slate-950">여행기</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500">
              여행자들이 남긴 장소별 후기를 한 곳에서 모아봤어요. 해변, 전망대, 산책 코스처럼
              여행지 중심으로 정리해서 실제 방문 전에 분위기와 팁을 빠르게 확인할 수 있어요.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <div className="grid gap-8 xl:grid-cols-2">
          {STORY_ITEMS.map((story) => (
            <StoryFeedCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </main>
  );
}

