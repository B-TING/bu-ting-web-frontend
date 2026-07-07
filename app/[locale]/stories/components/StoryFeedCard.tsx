'use client';

import Link from 'next/link';
import { Heart, MapPin, MessageCircle, Star } from 'lucide-react';
import { useState } from 'react';

import type { StoryItem } from '../story-types';
import { useStoryInteractions } from '../use-story-interactions';
import ImportTripDialog from './ImportTripDialog';
import StoryCommentsModal from './StoryCommentsModal';
import StoryMediaCarousel from './StoryMediaCarousel';

interface StoryFeedCardProps {
  story: StoryItem;
}

export default function StoryFeedCard({ story }: StoryFeedCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { comments, isHelpful, isImported, toggleHelpful, addComment, markImported } =
    useStoryInteractions(story.id, story.comments);

  const helpfulCount = story.helpfulCount + (isHelpful ? 1 : 0);

  return (
    <>
      <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <StoryMediaCarousel images={story.media} alt={story.title} className="aspect-[4/3]" />

        <div className="space-y-5 p-6">
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
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-400">{story.publishedAt}</p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950">{story.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{story.summary}</p>
              </div>
              <Link
                href={`/stories/${story.slug}`}
                className="shrink-0 text-sm font-semibold text-sky-700 transition hover:text-sky-500"
              >
                자세히 보기
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-800">{story.rating.toFixed(1)}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{story.address}</span>
            </div>
          </div>

          <div className="rounded-[28px] bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MessageCircle className="h-4 w-4 text-slate-500" />
                댓글 미리보기
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="text-sm font-semibold text-sky-700 transition hover:text-sky-500"
              >
                댓글 남기기
              </button>
            </div>

            <div className="space-y-3">
              {comments.slice(0, 2).map((comment) => (
                <div key={comment.id} className="rounded-2xl bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">{comment.author}</p>
                    <p className="text-xs text-slate-400">{comment.createdAt}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                </div>
              ))}

              {comments.length === 0 ? (
                <p className="text-sm text-slate-400">아직 댓글이 없어요. 첫 댓글을 남겨 보세요.</p>
              ) : null}
            </div>
          </div>
        </div>
      </article>

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

