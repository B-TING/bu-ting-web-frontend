'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTripWizardStore } from '@/stores/useTripWizardStore';
import { useCreateTravel } from '@/hooks/use-create-travel';
import { getTravelCreateErrorMessage } from '@/lib/travel-error-message';
import { mapTripWizardDataToTravelCreateRequest } from '@/lib/trip-wizard-to-travel-request';
import type { TripWizardData } from '@/types/tripWizard';
import Step1Title from './steps/Step1Title';
import Step2DateRange from './steps/Step2DateRange';
import Step3HeadCount from './steps/Step3HeadCount';
import Step4CompanionType from './steps/Step4CompanionType';
import Step5TravelStyle from './steps/Step5TravelStyle';
import Step6TravelPace from './steps/Step6TravelPace';
import Step7Constraints from './steps/Step7Constraints';
import Step8Attractions from './steps/Step8Attractions';
import Step9Food from './steps/Step9Food';
import Step10Accommodation from './steps/Step10Accommodation';
import Step11GenerationMethod from './steps/Step11GenerationMethod';
import { cn } from '@/lib/utils';

type StepKey =
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'step6'
  | 'step7'
  | 'step8'
  | 'step9'
  | 'step10'
  | 'step11';

const STEP_KEYS: StepKey[] = [
  'step1',
  'step2',
  'step3',
  'step4',
  'step5',
  'step6',
  'step7',
  'step8',
  'step9',
  'step10',
  'step11',
];

function getCanProceed(step: number, data: TripWizardData): boolean {
  switch (step) {
    case 1:
      return true;
    case 2:
      return !!data.startDate && !!data.endDate && data.endDate >= data.startDate;
    case 3:
      return true;
    case 4:
      return data.companionType !== null;
    case 5:
      return data.travelStyle !== null;
    case 6:
      return data.pace !== null;
    case 7:
      return true;
    case 8:
      return data.attractions.length > 0;
    case 9:
      return data.foods.length > 0;
    case 10:
      return data.accommodationStatus !== null && data.accommodationRegions.length > 0;
    case 11:
      return data.generationMethod !== null;
    default:
      return false;
  }
}

const STEP_COMPONENTS = [
  Step1Title,
  Step2DateRange,
  Step3HeadCount,
  Step4CompanionType,
  Step5TravelStyle,
  Step6TravelPace,
  Step7Constraints,
  Step8Attractions,
  Step9Food,
  Step10Accommodation,
  Step11GenerationMethod,
];

export default function TripWizard() {
  const router = useRouter();
  const t = useTranslations('trip.wizard');
  const tFood = useTranslations('trip.wizard.food');
  const tAccommodation = useTranslations('trip.wizard.accommodation');
  const { currentStep, totalSteps, data, updateData, nextStep, prevStep } = useTripWizardStore();
  const { mutate: createTravel, isPending, error } = useCreateTravel();

  const stepKey = STEP_KEYS[currentStep - 1];
  const StepComponent = STEP_COMPONENTS[currentStep - 1];
  const canProceed = getCanProceed(currentStep, data);
  const progress = (currentStep / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps;

  const handleNext = () => {
    if (!canProceed || isPending) return;

    if (isLastStep) {
      const payload = mapTripWizardDataToTravelCreateRequest(data, {
        foodLabels: data.foods.map((food) => tFood(food)),
        accommodationRegionLabels: data.accommodationRegions.map((region) =>
          tAccommodation(region)
        ),
      });

      createTravel(payload, {
        onSuccess: (travel) => {
          useTripWizardStore.getState().reset();
          router.push(
            data.generationMethod === 'ai'
              ? `/trips/new/ai?travelId=${travel.travelId}`
              : `/trips/${travel.travelId}`
          );
        },
      });
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 px-4 py-10">
      <div className="w-full max-w-lg">
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
                currentStep === 1 ? 'invisible' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t('nav.prev')}
            </button>

            <span className="text-sm font-medium tabular-nums text-gray-400">
              {currentStep}
              <span className="text-gray-300"> / </span>
              {totalSteps}
            </span>
          </div>

          {/* Step title */}
          <div className="px-7 pb-5 pt-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t(`${stepKey}.title`)}
            </h1>
            <p className="mt-1 text-sm text-gray-400">{t(`${stepKey}.subtitle`)}</p>
          </div>

          {/* Step content */}
          <div className="px-7 pb-7">
            <StepComponent
              data={data}
              onChange={updateData}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50/60 px-7 py-5">
            {isLastStep && error && (
              <p className="mb-3 text-center text-sm text-red-500">
                {getTravelCreateErrorMessage(error)}
              </p>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || isPending}
              className={cn(
                'w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200',
                canProceed && !isPending
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              )}
            >
              {isLastStep && isPending ? '...' : isLastStep ? t('nav.done') : t('nav.next')}
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
