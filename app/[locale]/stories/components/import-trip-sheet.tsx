'use client';

import { Check, ClipboardList, X } from 'lucide-react';
import Link from 'next/link';

import type { TravelStory } from '@/app/stories/types';

interface ImportTripSheetProps {
  story: TravelStory;
  status: 'confirm' | 'success';
  onImport: () => void;
  onClose: () => void;
}

export function ImportTripSheet({
  story,
  status,
  onImport,
  onClose,
}: ImportTripSheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="여행 계획 가져오기"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="relative w-full max-w-xl rounded-t-[2rem] bg-white px-5 pb-7 pt-10 shadow-2xl sm:rounded-[2rem] sm:px-8">
        <div className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-slate-200" />
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <X className="size-5" />
        </button>

        {status === 'confirm' ? (
          <>
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-3xl">📋</span>
              <h2 className="mt-4 text-2xl font-black text-slate-950">여행 계획 가져오기</h2>
              <p className="mt-2 text-sm text-slate-500">
                &apos;{story.title}&apos; 일정을 내 여행 계획으로 추가할까요?
              </p>
            </div>

            <dl className="mt-7 grid grid-cols-[72px_1fr] gap-x-3 gap-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm">
              <dt className="font-bold text-slate-500">제목</dt>
              <dd className="font-bold text-slate-900">{story.title}</dd>
              <dt className="font-bold text-slate-500">작성자</dt>
              <dd className="text-slate-700">{story.author.name}</dd>
              <dt className="font-bold text-slate-500">장소</dt>
              <dd className="text-slate-700">{story.location}</dd>
              <dt className="font-bold text-slate-500">기간</dt>
              <dd className="text-slate-700">{story.period}</dd>
            </dl>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button type="button" onClick={onClose} className="h-14 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50">
                취소
              </button>
              <button type="button" onClick={onImport} className="h-14 rounded-2xl bg-sky-600 font-bold text-white hover:bg-sky-700">
                여행 계획 가져오기
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Check className="size-9 stroke-[3]" />
            </span>
            <h2 className="mt-5 text-2xl font-black text-slate-950">여행 계획을 가져왔어요!</h2>
            <p className="mt-2 text-sm text-slate-500">내 여행 계획 목록에 추가됐어요. 바로 확인해 보세요.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button type="button" onClick={onClose} className="h-14 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50">
                닫기
              </button>
              <Link href={`/trips/${story.tripId}`} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-sky-600 font-bold text-white hover:bg-sky-700">
                <ClipboardList className="size-5" />
                계획 보기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
