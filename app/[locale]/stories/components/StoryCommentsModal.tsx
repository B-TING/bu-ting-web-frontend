'use client';

import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

import type { StoryComment } from '../story-types';

interface StoryCommentsModalProps {
  isOpen: boolean;
  comments: StoryComment[];
  onClose: () => void;
  onSubmit: (author: string, content: string) => void;
}

export default function StoryCommentsModal({
  isOpen,
  comments,
  onClose,
  onSubmit,
}: StoryCommentsModalProps) {
  const [author, setAuthor] = useState('guest');
  const [content, setContent] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!content.trim()) {
      return;
    }

    onSubmit(author, content);
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-sky-700">Comments</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">댓글</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="댓글 모달 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-6 py-5">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">{comment.author}</p>
                    <p className="text-xs text-slate-400">{comment.createdAt}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center text-slate-400">
              <MessageCircle className="h-8 w-8" />
              <p className="text-sm font-medium">아직 댓글이 없어요. 첫 댓글을 남겨 보세요!</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-sky-400"
              placeholder="작성자"
            />
            <div className="flex gap-3">
              <input
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-sky-400"
                placeholder="댓글을 남겨 보세요"
              />
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                <Send className="h-4 w-4" />
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

