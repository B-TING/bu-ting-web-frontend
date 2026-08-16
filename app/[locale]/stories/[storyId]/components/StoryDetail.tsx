'use client';

import { ArrowLeft, Bookmark, Heart, LoaderCircle, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { StoryRouteMap } from './StoryRouteMap';
import {
  useMyTravelRecordBookmarks,
  useTravelRecordComments,
  useTravelRecordDetail,
  useTravelRecordFeed,
  useTravelRecordInteractionMutations,
} from '../../hooks/use-travel-records';
import { detailRecordToStory } from '../../travel-record-adapter';
import { StoryImageCarousel } from '../../components/StoryImageCarousel';
import { TravelogueCommentSheet } from '../../components/TravelogueCommentSheet';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export function StoryDetail({ storyId }: { storyId: string }) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const detail = useTravelRecordDetail(storyId);
  const feed = useTravelRecordFeed();
  const comments = useTravelRecordComments(storyId);
  const bookmarks = useMyTravelRecordBookmarks(Boolean(accessToken));
  const interactions = useTravelRecordInteractionMutations(storyId);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);

  if (detail.isLoading) {
    return <LoaderCircle className="mx-auto mt-32 size-9 animate-spin text-sky-700" />;
  }

  if (detail.isError || !detail.data) {
    const notFound = detail.error instanceof ApiError && detail.error.status === 404;
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-950">
          {notFound ? '여행기를 찾을 수 없어요.' : '여행기를 불러오지 못했어요.'}
        </h1>
        <Link href="/stories" className="mt-6 inline-flex rounded-xl bg-sky-700 px-5 py-3 text-white">
          피드로 돌아가기
        </Link>
      </main>
    );
  }

  const story = detailRecordToStory(detail.data);
  const feedRecord = feed.data?.pages
    .flatMap((page) => page.items)
    .find((record) => record.travelRecordId === storyId);
  const isLiked = likedOverride ?? feedRecord?.likedByMe ?? false;
  const isBookmarked = Boolean(
    bookmarks.data?.some((item) => item.travelRecord.travelRecordId === storyId),
  );
  const requireLogin = () => {
    if (accessToken) return true;
    router.push('/auth/login');
    return false;
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6">
          <Link href="/stories" aria-label="여행기 목록으로 돌아가기" className="p-2 text-sky-700">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-3xl font-black text-slate-950">{story.title}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <StoryImageCarousel images={story.images} title={story.title} aspectClassName="aspect-[16/8]" />
          <p className="mt-6 text-base leading-7 text-slate-600">{story.summary}</p>
          <div className="mt-4 flex items-center gap-2">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-sky-700">{story.rating.toFixed(1)}점</span>
            <span className="text-sm text-slate-400">조회 {detail.data.viewCount}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!requireLogin()) return;
                if (isLiked) {
                  interactions.unlike.mutate(undefined, {
                    onSuccess: () => setLikedOverride(false),
                  });
                } else {
                  interactions.like.mutate(undefined, {
                    onSuccess: () => setLikedOverride(true),
                  });
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
            >
              <Heart className={['size-4', isLiked ? 'fill-current' : ''].join(' ')} />
              좋아요 {detail.data.likeCount}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!requireLogin()) return;
                if (isBookmarked) interactions.unbookmark.mutate();
                else interactions.bookmark.mutate();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700"
            >
              <Bookmark className={['size-4', isBookmarked ? 'fill-current' : ''].join(' ')} />
              {isBookmarked ? '저장됨' : '북마크'}
            </button>
            <button
              type="button"
              onClick={() => setIsCommentOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <MessageCircle className="size-4" /> 댓글 {comments.data?.length ?? 0}
            </button>
          </div>
        </article>

        {story.places.length ? (
          <>
            <div className="mt-6"><StoryRouteMap places={story.places} /></div>
            <section className="mt-6 grid gap-4">
              {story.places.map((place) => (
                <article key={place.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-950">{place.order}. {place.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{place.address}</p>
                  <p className="mt-4 leading-7 text-slate-700">{place.review}</p>
                </article>
              ))}
            </section>
          </>
        ) : null}
      </div>

      <TravelogueCommentSheet
        storyId={storyId}
        open={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
      />
    </main>
  );
}
