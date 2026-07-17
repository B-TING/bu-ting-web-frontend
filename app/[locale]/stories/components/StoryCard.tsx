'use client';

import { CalendarDays, Heart, MapPin, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { StoryImageCarousel } from '@/app/[locale]/stories/components/StoryImageCarousel';
import { TravelPlanImportSheet } from '@/app/[locale]/stories/components/TravelPlanImportSheet';
import { TravelogueCommentSheet } from '@/app/[locale]/stories/components/TravelogueCommentSheet';
import type { StoryComment, StoryFeedItem } from '@/app/[locale]/stories/story-data';
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

export function StoryCard({
  story,
  compact = false,
}: {
  story: StoryFeedItem;
  compact?: boolean;
}) {
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

  const previewComment = mergedComments[0];
  const displayedLikes = story.likesCount + (isLiked ? 1 : 0);

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-sky-700 text-lg font-bold text-white">
                {story.authorBadge}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{story.author}</p>
                <p className="text-sm text-slate-500">{story.subtitle}</p>
              </div>
            </div>

            <Link
              href={`/stories/${story.id}`}
              className="text-sm font-semibold text-sky-700 transition hover:text-sky-800"
            >
              자세히 보기
            </Link>
          </div>
        </div>

        <div className="px-6 py-6">
          <StoryImageCarousel
            images={story.images}
            title={story.title}
            aspectClassName={compact ? 'aspect-[16/11]' : 'aspect-[16/9]'}
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
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

          <div className="mt-5">
            <p className="text-sm text-slate-400">{formatDate(story.createdAt)}</p>
            <h2 className={compact ? 'mt-2 text-2xl font-black text-slate-950' : 'mt-2 text-3xl font-black text-slate-950'}>
              {story.title}
            </h2>

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

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {story.places.slice(0, compact ? 1 : 2).map((place) => (
              <div key={place.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin className="size-4 text-slate-400" />
                  {place.name}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{place.review}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-400" />
              {story.places.length}개 장소 후기
            </span>
            <button
              type="button"
              onClick={() => setIsCommentOpen(true)}
              className="inline-flex items-center gap-2 text-left transition hover:text-sky-700"
            >
              <MessageCircle className="size-4 text-slate-400" />
              댓글 {mergedComments.length}개
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900">댓글 미리보기</p>
              <button
                type="button"
                onClick={() => setIsCommentOpen(true)}
                className="text-sm font-semibold text-sky-700 transition hover:text-sky-800"
              >
                댓글 남기기
              </button>
            </div>

            {previewComment ? (
              <div className="mt-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900">{previewComment.author}</p>
                  <p className="text-sm text-slate-400">{formatDate(previewComment.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{previewComment.content}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-400">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
            )}
          </div>
        </div>
      </article>

      <TravelPlanImportSheet story={story} open={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <TravelogueCommentSheet
        storyId={story.id}
        open={isCommentOpen}
        baseComments={story.comments}
        onClose={() => setIsCommentOpen(false)}
      />
    </>
  );
}
