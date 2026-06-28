'use client';

import { useRouter } from 'next/navigation';
import { useTripWizardStore } from '@/stores/useTripWizardStore';
import type { TripWizardData } from '@/types/tripWizard';
import Step1DateRange from './steps/Step1DateRange';
import Step2HeadCount from './steps/Step2HeadCount';
import Step3CompanionType from './steps/Step3CompanionType';
import Step4TravelStyle from './steps/Step4TravelStyle';
import Step5Constraints from './steps/Step5Constraints';
import Step6Attractions from './steps/Step6Attractions';
import Step7Food from './steps/Step7Food';
import Step8Accommodation from './steps/Step8Accommodation';
import Step9GenerationMethod from './steps/Step9GenerationMethod';
import { cn } from '@/lib/utils';

const STEP_META = [
  {
    title: '언제 여행하시나요?',
    subtitle: '시작일과 종료일을 선택해 주세요',
  },
  {
    title: '몇 명이서 가시나요?',
    subtitle: '본인 포함 인원',
  },
  {
    title: '동행인 유형은?',
    subtitle: '복수 선택 가능',
  },
  {
    title: '선호하는 여행 스타일은?',
    subtitle: '여행 테마 · 복수 선택',
  },
  {
    title: '여행 제약 조건이 있나요?',
    subtitle: '해당하는 항목을 모두 선택해 주세요',
  },
  {
    title: '가고 싶은 관광지',
    subtitle: '부산 대표 스팟 · 복수 선택',
  },
  {
    title: '좋아하는 음식',
    subtitle: '맛집 추천에 반영',
  },
  {
    title: '숙소는 정하셨나요?',
    subtitle: '예약 완료 또는 후보 지역 선택',
  },
  {
    title: '일정 생성 방식',
    subtitle: 'AI 자동 생성 또는 후보에서 선택',
  },
];

function getCanProceed(step: number, data: TripWizardData): boolean {
  switch (step) {
    case 1:
      return (
        !!data.startDate &&
        !!data.endDate &&
        data.endDate >= data.startDate
      );
    case 2:
      return true;
    case 3:
      return data.companionTypes.length > 0;
    case 4:
      return data.travelStyles.length > 0;
    case 5:
      return true;
    case 6:
      return data.attractions.length > 0;
    case 7:
      return data.foods.length > 0;
    case 8:
      return data.accommodationStatus !== null;
    case 9:
      return data.generationMethod !== null;
    default:
      return false;
  }
}

const STEP_COMPONENTS = [
  Step1DateRange,
  Step2HeadCount,
  Step3CompanionType,
  Step4TravelStyle,
  Step5Constraints,
  Step6Attractions,
  Step7Food,
  Step8Accommodation,
  Step9GenerationMethod,
];

export default function TripWizard() {
  const router = useRouter();
  const { currentStep, totalSteps, data, updateData, nextStep, prevStep } =
    useTripWizardStore();

  const meta = STEP_META[currentStep - 1];
  const StepComponent = STEP_COMPONENTS[currentStep - 1];
  const canProceed = getCanProceed(currentStep, data);
  const progress = (currentStep / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps;

  const handleNext = () => {
    if (!canProceed) return;
    if (isLastStep) {
      useTripWizardStore.getState().reset();
      router.push('/trips/new/ai');
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur-sm">

          {/* Progress bar */}
          <div className="h-1 w-full bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-5">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-all duration-200',
                currentStep === 1
                  ? 'invisible'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              이전
            </button>

            <span className="text-sm font-medium tabular-nums text-gray-400">
              {currentStep}
              <span className="text-gray-300"> / </span>
              {totalSteps}
            </span>
          </div>

          {/* Step title */}
          <div className="px-7 pb-5 pt-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{meta.title}</h1>
            <p className="mt-1 text-sm text-gray-400">{meta.subtitle}</p>
          </div>

          {/* Step content */}
          <div className="px-7 pb-7">
            <StepComponent data={data} onChange={updateData} />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50/60 px-7 py-5">
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                'w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200',
                canProceed
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              )}
            >
              {isLastStep ? '완료' : '다음'}
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="mt-5 flex justify-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'block rounded-full transition-all duration-300',
                i + 1 === currentStep
                  ? 'h-2 w-5 bg-blue-500'
                  : i + 1 < currentStep
                  ? 'size-2 bg-blue-300'
                  : 'size-2 bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
