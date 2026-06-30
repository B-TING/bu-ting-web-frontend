'use client';

import { MessageCircle, UserRound, X } from 'lucide-react';

interface FestivalCommentSheetProps {
  onClose: () => void;
}

export function FestivalCommentSheet({ onClose }: FestivalCommentSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 sm:px-6 sm:pt-20">
      <button type="button" aria-label="코멘트 닫기" className="absolute inset-0" onClick={onClose} />
      <section role="dialog" aria-modal="true" aria-labelledby="comment-sheet-title" className="relative z-10 w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="mx-auto -mt-2 mb-5 h-1.5 w-12 rounded-full bg-slate-300" />
        <div className="flex items-center justify-between">
          <h2 id="comment-sheet-title" className="text-xl font-black text-slate-950">코멘트</h2>
          <button type="button" aria-label="닫기" onClick={onClose} className="flex size-9 items-center justify-center rounded-full hover:bg-slate-100">
            <X className="size-5 text-slate-500" />
          </button>
        </div>
        <p className="mt-1 text-xs text-sky-700">코멘트 기능은 준비 중이에요.</p>

        <div className="mt-6 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100"><UserRound className="size-4 text-slate-500" /></span>
          <textarea disabled placeholder="축제 후기를 남겨보세요" className="h-24 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm placeholder:text-slate-300" />
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <MessageCircle className="mx-auto size-8 text-slate-200" />
          <p className="mt-3 text-sm text-slate-400">아직 코멘트가 없어요.</p>
        </div>

        <button type="button" onClick={onClose} className="mt-6 h-13 w-full rounded-2xl bg-sky-700 font-bold text-white hover:bg-sky-800">닫기</button>
      </section>
    </div>
  );
}
