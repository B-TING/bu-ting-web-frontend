'use client';

import { CircleAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export function MissingTravelSurveyModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const open = searchParams.get('travelSurvey') === 'missing';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-5" role="dialog" aria-modal="true" aria-labelledby="missing-survey-title">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50">
          <CircleAlert className="size-7 text-amber-600" />
        </span>
        <h2 id="missing-survey-title" className="mt-5 text-xl font-bold text-slate-950">
          여행 취향 정보가 없어요
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          맞춤 여행 추천을 받으려면 마이페이지에서 여행 취향을 설정해 주세요.
        </p>
        <Link href="/my/preferences" className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-sky-700 font-bold text-white hover:bg-sky-800">
          취향 설정하기
        </Link>
        <button type="button" onClick={() => router.replace('/')} className="mt-3 h-10 w-full text-sm font-semibold text-slate-500 hover:text-slate-800">
          나중에 하기
        </button>
      </div>
    </div>
  );
}
