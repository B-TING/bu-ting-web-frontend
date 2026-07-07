'use client';

import { ClipboardList, CheckCircle2, X } from 'lucide-react';

import type { StoryTripImport } from '../story-types';

interface ImportTripDialogProps {
  isOpen: boolean;
  isImported: boolean;
  tripImport: StoryTripImport;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ImportTripDialog({
  isOpen,
  isImported,
  tripImport,
  onClose,
  onConfirm,
}: ImportTripDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              {isImported ? <CheckCircle2 className="h-7 w-7" /> : <ClipboardList className="h-7 w-7" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-700">Travel Plan</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {isImported ? '여행 계획을 가져왔어요!' : '여행 계획 가져오기'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="여행 계획 가져오기 모달 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm leading-6 text-slate-500">
          {isImported
            ? '내 여행 계획 목록에 추가되었어요. 이제 일정에서 이어서 확인해 보세요.'
            : `'${tripImport.title}' 여행기를 내 여행 계획으로 가져올까요?`}
        </p>

        <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <div className="grid gap-3 text-sm text-slate-600">
            <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3">
              <span className="font-semibold text-slate-400">제목</span>
              <span>{tripImport.title}</span>
            </div>
            <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3">
              <span className="font-semibold text-slate-400">작성자</span>
              <span>{tripImport.author}</span>
            </div>
            <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3">
              <span className="font-semibold text-slate-400">장소</span>
              <span>{tripImport.place}</span>
            </div>
            <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3">
              <span className="font-semibold text-slate-400">기간</span>
              <span>{tripImport.period}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            {isImported ? '계획 보기' : '여행 계획 가져오기'}
          </button>
        </div>
      </div>
    </div>
  );
}

