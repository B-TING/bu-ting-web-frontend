'use client';

import { MessageCircle, Send, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { StoryComment } from '@/app/[locale]/stories/story-data';
import { useTravelogueStore } from '@/stores/travelogue-store';

interface TravelogueCommentSheetProps {
  storyId: string;
  open: boolean;
  baseComments: StoryComment[];
  onClose: () => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export function TravelogueCommentSheet({
  storyId,
  open,
  baseComments,
  onClose,
}: TravelogueCommentSheetProps) {
  const addComment = useTravelogueStore((state) => state.addComment);
  const commentsByStoryId = useTravelogueStore((state) => state.commentsByStoryId);
  const storedComments = commentsByStoryId[storyId] ?? [];
  const [content, setContent] = useState('');

  const mergedComments = useMemo(
    () =>
      [...baseComments, ...storedComments].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [baseComments, storedComments],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white shadow-2xl">
        <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200" />

        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-sky-50 text-sky-700">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">댓글</p>
              <h2 className="text-2xl font-black text-slate-950">후기 댓글 남기기</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-t border-slate-100 px-6 py-5">
          <label className="block text-sm font-semibold text-slate-700">댓글 내용</label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="이 여행기가 어땠는지 댓글로 남겨 주세요."
            className="mt-3 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const trimmed = content.trim();

                if (!trimmed) {
                  return;
                }

                addComment(storyId, 'guest', trimmed);
                setContent('');
              }}
              className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
            >
              <Send className="size-4" />
              댓글 등록
            </button>
          </div>
        </div>

        <div className="max-h-[40vh] overflow-y-auto border-t border-slate-100 px-6 py-5">
          <div className="space-y-4">
            {mergedComments.length > 0 ? (
              mergedComments.map((comment) => (
                <article key={comment.id} className="rounded-2xl bg-slate-50 px-4 py-4">
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
        </div>
      </div>
    </div>
  );
}
