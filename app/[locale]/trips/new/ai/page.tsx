'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useTripWizardStore } from '@/stores/useTripWizardStore';
import { useCreateAiPlan } from '@/hooks/use-create-ai-plan';
import { mapTripWizardDataToAiPlanRequest } from '@/lib/trip-wizard-to-ai-plan-request';

export default function TripNewAiPage() {
  const t = useTranslations('trip.pages.aiResult');
  const tTravelStyle = useTranslations('trip.wizard.travelStyle');
  const router = useRouter();
  const searchParams = useSearchParams();
  const travelId = searchParams.get('travelId') ?? '';

  const wizardData = useTripWizardStore((s) => s.data);
  const { mutate: runCreateAiPlan, isPending, isError } = useCreateAiPlan(travelId);

  const requestedRef = useRef(false);

  const triggerCreate = () => {
    const request = mapTripWizardDataToAiPlanRequest(wizardData, {
      foodIds: wizardData.foods.map((food) => food.replace(/_/g, '-')),
      purposeLabels: wizardData.travelStyles.map((style) => tTravelStyle(style)),
    });

    runCreateAiPlan(request, {
      onSuccess: () => {
        useTripWizardStore.getState().reset();
        toast.success('여행 일정이 생성됐어요!');
        router.replace(`/trips?travelId=${travelId}`);
      },
    });
  };

  useEffect(() => {
    if (!travelId || requestedRef.current) return;
    requestedRef.current = true;
    triggerCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelId]);

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      {isPending && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      )}

      {isError && !isPending && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-sm text-red-500">{t('errorTitle')}</p>
          <button
            type="button"
            onClick={triggerCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {t('retry')}
          </button>
        </div>
      )}
    </main>
  );
}
