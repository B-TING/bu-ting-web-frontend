'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useMyTravels } from '@/hooks/use-my-travels';
import { TripTabHeader } from '../components/TripTabHeader';
import { RebootFab } from '../components/RebootFab';

interface TripDetailPageProps {
  params: Promise<{ tripId: string }>;
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = use(params);
  const t = useTranslations('trip.pages');
  const tStatus = useTranslations('trip.status');
  const { data: travels, isPending, isError } = useMyTravels();

  const travel = travels?.find((item) => item.travelId === tripId);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <TripTabHeader
        tripTitle={travel?.title || t('detailTitle')}
        tripId={tripId}
        backHref="/trips"
      />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        {isPending && <p className="text-sm text-gray-400">{t('detailLoading')}</p>}
        {(isError || (!isPending && !travel)) && (
          <p className="text-sm text-red-500">{t('detailNotFound')}</p>
        )}
        {travel && (
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">{travel.title || t('detailTitle')}</h1>
            <p className="text-sm text-gray-500">
              {travel.startDate} ~ {travel.endDate}
            </p>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              {tStatus(travel.status)}
            </span>
          </div>
        )}
      </div>

      <RebootFab tripId={tripId} />
    </main>
  );
}
