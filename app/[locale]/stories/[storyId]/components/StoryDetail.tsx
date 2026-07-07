'use client';

import { ArrowLeft, Heart, MapPin, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { StoryImageCarousel } from '@/app/[locale]/stories/components/StoryImageCarousel';
import { TravelPlanImportSheet } from '@/app/[locale]/stories/components/TravelPlanImportSheet';
import { TravelogueCommentSheet } from '@/app/[locale]/stories/components/TravelogueCommentSheet';
import type { StoryComment, StoryFeedItem } from '@/app/[locale]/stories/story-data';
import { StoryRouteMap } from '@/app/[locale]/stories/[storyId]/components/StoryRouteMap';
import { useTravelogueStore } from '@/stores/travelogue-store';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

function getMergedComments(baseComments: StoryComment[], extraComments: StoryComment[]) {
  return [...baseComments, ...extraComments].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function StoryDetail({ story }: { story: StoryFeedItem }) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const toggleLike = useTravelogueStore((state) => state.toggleLike);
  const likedStoryIds = useTravelogueStore((state) => state.likedStoryIds);
  const commentsByStoryId = useTravelogueStore((state) => state.commentsByStoryId);
  const importedPlans = useTravelogueStore((state) => state.importedPlans);

  const isLiked = likedStoryIds.includes(story.id);
  const storedComments = commentsByStoryId[story.id] ?? [];
  const hasImportedPlan = importedPlans.some((item) => item.storyId === story.id);

  const mergedComments = useMemo(
    () => getMergedComments(story.comments, storedComments),
    [storedComments, story.comments],
  );

  const displayedLikes = story.likesCount + (isLiked ? 1 : 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6">
          <Link
            href="/stories"
            aria-label="여행기 목록으로 돌아가기"
            className="flex size-10 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-50"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div>
            <p className="text-sm font-semibold text-sky-700">Travel Story Detail</p>
            <h1 className="text-3xl font-black text-slate-950">{story.title}</h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-sky-700 text-lg font-bold text-white">
                  {story.authorBadge}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{story.author}</p>
                  <p className="text-sm text-slate-500">{story.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleLike(story.id)}
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                    isLiked
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-rose-50 text-rose-500 hover:bg-rose-100',
                  ].join(' ')}
                >
                  <Heart className={['size-4', isLiked ? 'fill-current' : ''].join(' ')} />
                  도움이 되었어요! {displayedLikes}명
                </button>

                <button
                  type="button"
                  onClick={() => setIsImportOpen(true)}
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                    hasImportedPlan
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                  ].join(' ')}
                >
                  여행 계획 가져오기
                </button>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-slate-400">{formatDate(story.createdAt)}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <Star
                      key={index}
                      className={[
                        'size-4',
                        index <= Math.round(story.rating) ? 'fill-current' : 'fill-transparent',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <span className="font-semibold text-sky-700">{story.rating.toFixed(1)}점</span>
              </div>
              <p className="mt-4 text-base leading-7 text-slate-600">{story.summary}</p>
            </div>
          </div>

          <div className="px-6 py-6">
            <StoryImageCarousel images={story.images} title={story.title} aspectClassName="aspect-[16/8]" />
          </div>
        </article>

        <div className="mt-6">
          <StoryRouteMap places={story.places} />
        </div>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-sm font-semibold text-sky-700">장소별 후기</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">방문 장소 리뷰</h2>
          </div>

          <div className="grid gap-5 px-6 py-6">
            {story.places.map((place) => (
              <article
                key={place.id}
                className="grid gap-5 rounded-3xl border border-slate-200 p-5 lg:grid-cols-[220px_1fr]"
              >
                <div className="overflow-hidden rounded-2xl bg-slate-100">
                  <img src={place.imageUrl} alt={place.name} className="h-full w-full object-cover" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">
                      {place.order}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-950">{place.name}</h3>
                      <p className="text-sm text-slate-500">{place.category}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <Star
                          key={index}
                          className={[
                            'size-4',
                            index <= Math.round(place.rating) ? 'fill-current' : 'fill-transparent',
                          ].join(' ')}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-sky-700">{place.rating.toFixed(1)}점</span>
                  </div>

                  <p className="mt-4 inline-flex items-start gap-2 text-sm leading-6 text-slate-500">
                    <MapPin className="mt-1 size-4 shrink-0 text-slate-400" />
                    {place.address}
                  </p>

                  <p className="mt-4 text-base leading-7 text-slate-700">{place.review}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {place.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-sky-700">댓글</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">총 {mergedComments.length}개의 댓글</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCommentOpen(true)}
                className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                댓글 남기기
              </button>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6">
            {mergedComments.length > 0 ? (
              mergedComments.map((comment) => (
                <article key={comment.id} className="rounded-2xl bg-slate-50 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900">{comment.author}</p>
                    <p className="text-sm text-slate-400">{formatDate(comment.createdAt)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{comment.content}</p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                아직 댓글이 없어요. 첫 댓글을 남겨보세요!
              </div>
            )}
          </div>
        </section>
      </section>

      <TravelPlanImportSheet story={story} open={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <TravelogueCommentSheet
        storyId={story.id}
        open={isCommentOpen}
        baseComments={story.comments}
        onClose={() => setIsCommentOpen(false)}
      />
    </main>
  );
}
