'use client';

import { MessageCircle, Pencil, Send, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  useTravelRecordCommentMutations,
  useTravelRecordComments,
} from '@/app/[locale]/stories/hooks/use-travel-records';
import { useAuthStore } from '@/stores/auth-store';

interface TravelogueCommentSheetProps {
  storyId: string;
  open: boolean;
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
  onClose,
}: TravelogueCommentSheetProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const comments = useTravelRecordComments(storyId, open);
  const mutations = useTravelRecordCommentMutations(storyId);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!open) return null;

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    if (editingId) {
      mutations.update.mutate(
        { commentId: editingId, content: trimmed },
        { onSuccess: () => { setContent(''); setEditingId(null); } },
      );
      return;
    }

    mutations.create.mutate(trimmed, { onSuccess: () => setContent('') });
  };

  const pending =
    mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <MessageCircle className="size-5 text-sky-700" />
            <h2 className="text-2xl font-black text-slate-950">여행기 댓글</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="p-2 text-slate-500">
            <X className="size-5" />
          </button>
        </div>

        <div className="border-t border-slate-100 px-6 py-5">
          <textarea
            value={content}
            maxLength={1000}
            onChange={(event) => setContent(event.target.value)}
            placeholder={accessToken ? '댓글을 입력해 주세요.' : '로그인 후 댓글을 작성할 수 있어요.'}
            className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{content.length}/1000</span>
            <button
              type="button"
              onClick={submit}
              disabled={pending || !content.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send className="size-4" /> {editingId ? '수정' : '등록'}
            </button>
          </div>
        </div>

        <div className="max-h-[45vh] overflow-y-auto border-t border-slate-100 px-6 py-5">
          {comments.isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">댓글을 불러오는 중...</p>
          ) : comments.isError ? (
            <p className="py-8 text-center text-sm text-red-600">댓글을 불러오지 못했어요.</p>
          ) : comments.data?.length ? (
            <div className="space-y-4">
              {comments.data.map((comment) => (
                <article key={comment.commentId} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{comment.authorNickname}</p>
                      <p className="text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
                    </div>
                    {user?.userId === comment.authorId ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="댓글 수정"
                          onClick={() => { setEditingId(comment.commentId); setContent(comment.content); }}
                          className="p-2 text-slate-500"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="댓글 삭제"
                          onClick={() => mutations.remove.mutate(comment.commentId)}
                          className="p-2 text-red-500"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{comment.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">첫 댓글을 남겨보세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}
