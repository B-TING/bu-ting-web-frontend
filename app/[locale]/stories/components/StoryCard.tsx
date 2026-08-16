'use client';

import { Bookmark, CalendarDays, Heart, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  useMyTravelRecordBookmarks,
  useTravelRecordInteractionMutations,
} from '@/app/[locale]/stories/hooks/use-travel-records';
import type { StoryFeedItem } from '@/app/[locale]/stories/story-data';
import { StoryImageCarousel } from '@/app/[locale]/stories/components/StoryImageCarousel';
import { TravelogueCommentSheet } from '@/app/[locale]/stories/components/TravelogueCommentSheet';
import { useAuthStore } from '@/stores/auth-store';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export function StoryCard({
  story,
  initialLiked,
  compact = false,
}: {
  story: StoryFeedItem;
  initialLiked: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const interactions = useTravelRecordInteractionMutations(story.id);
  const bookmarks = useMyTravelRecordBookmarks(Boolean(accessToken));
  const isBookmarked = Boolean(
    bookmarks.data?.some((item) => item.travelRecord.travelRecordId === story.id),
  );
  const interactionPending =
    interactions.like.isPending ||
    interactions.unlike.isPending ||
    interactions.bookmark.isPending ||
    interactions.unbookmark.isPending;

  const requireLogin = () => {
    if (accessToken) return true;
    router.push('/auth/login');
    return false;
  };

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-sky-700 text-lg font-bold text-white">
              {story.authorBadge}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{story.author}</p>
              <p className="text-sm text-slate-500">{story.subtitle}</p>
            </div>
          </div>
          <Link href={`/stories/${story.id}`} className="text-sm font-semibold text-sky-700">
            상세 보기
          </Link>
        </div>

        <div className="px-6 py-6">
          <StoryImageCarousel
            images={story.images}
            title={story.title}
            aspectClassName={compact ? 'aspect-[16/11]' : 'aspect-[16/9]'}
          />

          <p className="mt-5 text-sm text-slate-400">{formatDate(story.createdAt)}</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">{story.title}</h2>
          <div className="mt-3 flex items-center gap-2 text-amber-400">
            <Star className="size-4 fill-current" />
            <span className="font-semibold text-sky-700">{story.rating.toFixed(1)}점</span>
          </div>
          <p className="mt-4 text-base leading-7 text-slate-600">{story.summary}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={interactionPending}
              onClick={() => {
                if (!requireLogin()) return;
                if (initialLiked) interactions.unlike.mutate();
                else interactions.like.mutate();
              }}
              className={[
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
                initialLiked ? 'bg-rose-100 text-rose-600' : 'bg-rose-50 text-rose-500',
              ].join(' ')}
            >
              <Heart className={['size-4', initialLiked ? 'fill-current' : ''].join(' ')} />
              좋아요 {story.likesCount}
            </button>
            <button
              type="button"
              disabled={interactionPending}
              onClick={() => {
                if (!requireLogin()) return;
                if (isBookmarked) interactions.unbookmark.mutate();
                else interactions.bookmark.mutate();
              }}
              className={[
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
                isBookmarked ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              <Bookmark className={['size-4', isBookmarked ? 'fill-current' : ''].join(' ')} />
              {isBookmarked ? '저장됨' : '북마크'}
            </button>
            <button
              type="button"
              onClick={() => setIsCommentOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              <MessageCircle className="size-4" /> 댓글 보기
            </button>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="size-4" />
            {story.travelPeriod.startDate.slice(0, 10)} ~ {story.travelPeriod.endDate.slice(0, 10)}
          </p>
        </div>
      </article>

      <TravelogueCommentSheet
        storyId={story.id}
        open={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
      />
    </>
  );
}
