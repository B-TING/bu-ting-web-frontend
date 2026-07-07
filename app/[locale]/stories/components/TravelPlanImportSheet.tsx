'use client';

import { Check, ClipboardList, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { StoryFeedItem } from '@/app/[locale]/stories/story-data';
import { useTravelogueStore } from '@/stores/travelogue-store';

type ImportStep = 'confirm' | 'active-plan-warning' | 'completed';

interface TravelPlanImportSheetProps {
  story: StoryFeedItem;
  open: boolean;
  onClose: () => void;
}

function getPeriodLabel(story: StoryFeedItem) {
  if (!story.places[0] || !story.places[story.places.length - 1]) {
    return '일정 정보 없음';
  }

  return `${story.travelPeriod.startDate} ~ ${story.travelPeriod.endDate}`;
}

export function TravelPlanImportSheet({
  story,
  open,
  onClose,
}: TravelPlanImportSheetProps) {
  const activePlanTitle = useTravelogueStore((state) => state.activePlanTitle);
  const importPlan = useTravelogueStore((state) => state.importPlan);
  const importedPlans = useTravelogueStore((state) => state.importedPlans);
  const [currentStep, setCurrentStep] = useState<ImportStep>('confirm');

  const hasImportedPlan = importedPlans.some((item) => item.storyId === story.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentStep(hasImportedPlan ? 'completed' : 'confirm');
  }, [hasImportedPlan, open]);

  if (!open) {
    return null;
  }

  const handleImport = () => {
    importPlan({
      storyId: story.id,
      title: story.title,
      author: story.author,
      placeCount: story.places.length,
      periodLabel: getPeriodLabel(story),
      importedAt: new Date().toISOString(),
    });
    setCurrentStep('completed');
  };

  const handlePrimaryAction = () => {
    if (currentStep === 'completed') {
      onClose();
      return;
    }

    if (currentStep === 'confirm' && activePlanTitle) {
      setCurrentStep('active-plan-warning');
      return;
    }

    handleImport();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-slate-200" />

        {currentStep === 'completed' ? (
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="size-8" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">여행 계획을 가져왔어요!</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              내 여행 계획 목록에 추가됐어요. 바로 확인해 보세요.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-sky-700 px-5 py-3 font-semibold text-white transition hover:bg-sky-800"
              >
                계획 보기
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                  <ClipboardList className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">여행 계획 가져오기</p>
                  <h2 className="text-2xl font-black text-slate-950">{story.title}</h2>
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

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-slate-400">제목</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{story.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-400">작성자</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{story.author}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-400">방문 장소</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{story.places.length}곳</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-400">기간</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{getPeriodLabel(story)}</dd>
                </div>
              </dl>
            </div>

            {currentStep === 'active-plan-warning' ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                현재 진행 중인 여행 계획 <span className="font-semibold">“{activePlanTitle}”</span> 이 있어요.
                그래도 이 여행기를 내 계획으로 가져올까요?
              </div>
            ) : (
              <p className="mt-5 text-base leading-7 text-slate-600">
                이 여행기의 방문 장소와 흐름을 내 여행 계획의 참고용으로 추가할 수 있어요.
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="rounded-2xl bg-sky-700 px-5 py-3 font-semibold text-white transition hover:bg-sky-800"
              >
                여행 계획 가져오기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
