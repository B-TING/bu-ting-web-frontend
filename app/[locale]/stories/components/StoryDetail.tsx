'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, MapPin, MessageCircle, Star } from 'lucide-react';
import { useState } from 'react';

import type { StoryItem } from '../story-types';
import { useStoryInteractions } from '../use-story-interactions';
import ImportTripDialog from './ImportTripDialog';
import StoryCommentsModal from './StoryCommentsModal';
import StoryMediaCarousel from './StoryMediaCarousel';

interface StoryDetailProps {
  story: StoryItem;
}

export default function StoryDetail({ story }: StoryDetailProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { comments, isHelpful, isImported, toggleHelpful, addComment, markImported } =
    useStoryInteractions(story.id, story.comments);

  const helpfulCount = story.helpfulCount + (isHelpful ? 1 : 0);

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-7xl items-start gap-4 px-6 py-10 lg:px-10">
            <Link
              href="/stories"
              className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
              aria-label="여행기 목록으로 돌아가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm font-semibold text-sky-700">Place Review Detail</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950">{story.title}</h1>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <StoryMediaCarousel images={story.media} alt={story.title} className="aspect-[4/3]" />
            </div>

            <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                  {story.author.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{story.author.name}</p>
                  <p className="text-xs text-slate-400">{story.author.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={toggleHelpful}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isHelpful
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isHelpful ? 'fill-current' : ''}`} />
                  도움이 되었어요 {helpfulCount > 0 ? `${helpfulCount}` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportOpen(true)}
                  className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                >
                  여행 계획 가져오기
                </button>
                <button
                  type="button"
                  onClick={() => setIsCommentsOpen(true)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  댓글 전체 보기
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-400">{story.publishedAt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-800">{story.rating.toFixed(1)}</span>
                    <span>평점</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-slate-400" />
                    <span>{comments.length}개 댓글</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{story.address}</span>
                </div>
                <p className="text-base leading-7 text-slate-600">{story.summary}</p>
              </div>

              <div className="rounded-[28px] bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-800">여행 경로</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{story.routeSummary}</p>
                <div className="mt-4 overflow-hidden rounded-3xl">
                  <img
                    src={story.mapImageUrl}
                    alt={`${story.placeName} 경로 지도`}
                    className="h-[260px] w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold text-sky-700">Review Collection</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">장소별 후기</h2>
            </div>

            <div className="space-y-5">
              {story.reviews.map((review) => (
                <article key={review.id} className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">{review.placeName}</h3>
                      <p className="mt-2 text-sm text-slate-400">{review.visitedAt}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {review.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600">{review.content}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StoryCommentsModal
        isOpen={isCommentsOpen}
        comments={comments}
        onClose={() => setIsCommentsOpen(false)}
        onSubmit={addComment}
      />

      <ImportTripDialog
        isOpen={isImportOpen}
        isImported={isImported}
        tripImport={story.tripImport}
        onClose={() => setIsImportOpen(false)}
        onConfirm={() => {
          if (!isImported) {
            markImported();
            return;
          }

          setIsImportOpen(false);
        }}
      />
    </>
  );
}
