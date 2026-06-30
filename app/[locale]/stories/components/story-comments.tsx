'use client';

import { Send } from 'lucide-react';
import { FormEvent, useState } from 'react';

import type { StoryComment } from '@/app/stories/types';

interface StoryCommentsProps {
  initialComments: StoryComment[];
}

export function StoryComments({ initialComments }: StoryCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setComments((current) => [
      ...current,
      {
        id: `comment-${Date.now()}`,
        author: '응원',
        content: trimmedContent,
        createdAt: '방금 전',
      },
    ]);
    setContent('');
  };

  return (
    <section className="border-t border-slate-200 px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-950">댓글</h2>
        <span className="text-xs font-semibold text-slate-400">{comments.length}개</span>
      </div>

      <div className="mt-4 space-y-4">
        {comments.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            아직 댓글이 없어요. 첫 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-black text-sky-700">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{comment.author}</p>
                  <time className="text-[11px] text-slate-400">{comment.createdAt}</time>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{comment.content}</p>
              </div>
            </article>
          ))
        )}
      </div>

      <form onSubmit={submitComment} className="mt-5 flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-black text-white">
          G
        </div>
        <label className="sr-only" htmlFor="story-comment">댓글 작성</label>
        <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-sky-500">
          <input
            id="story-comment"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="응원의 댓글을 남겨보세요"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            aria-label="댓글 등록"
            className="flex size-9 items-center justify-center rounded-full text-sky-600 hover:bg-sky-50 disabled:text-slate-300"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </section>
  );
}
