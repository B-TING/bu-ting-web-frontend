'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TripTabHeader } from './components/TripTabHeader';
import { useMyTravels } from '@/hooks/use-my-travels';
import { useTravelPlans } from '@/hooks/use-travel-plans';
import { mapTravelPlansResponseToDays } from '@/lib/travel-plans-to-itinerary';
import { diffDaysInclusive, formatDayOfWeek, formatShortDate } from '@/lib/format-date';
import type { MyTravelResponse } from '@/types/travel';

export default function TripsPage() {
  const { data: travels, isPending, isError } = useMyTravels();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
        <LoadingOrErrorMessage textKey="loading" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
        <LoadingOrErrorMessage
          textKey="loadError"
          isError
        />
      </div>
    );
  }

  const upcomingTrip = pickUpcomingTrip(travels ?? []);

  return upcomingTrip ? <TripOverview trip={upcomingTrip} /> : <EmptyState />;
}

function pickUpcomingTrip(travels: MyTravelResponse[]): MyTravelResponse | null {
  const candidates = travels.filter((trip) => trip.status !== 'COMPLETED');
  const pool = candidates.length > 0 ? candidates : travels;
  if (pool.length === 0) return null;

  return pool.slice().sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
}

function LoadingOrErrorMessage({
  textKey,
  isError = false,
}: {
  textKey: 'loading' | 'loadError';
  isError?: boolean;
}) {
  const t = useTranslations('trip.overview');
  return <p className={cn('text-sm', isError ? 'text-red-500' : 'text-gray-400')}>{t(textKey)}</p>;
}

function TripOverview({ trip }: { trip: MyTravelResponse }) {
  const t = useTranslations('trip.overview');
  const plansQuery = useTravelPlans(trip.travelId);

  const days = plansQuery.data ? mapTravelPlansResponseToDays(plansQuery.data) : [];
  const highlightDays = days.slice(0, 3);
  const nextDay = days.find((day) => day.items.some((item) => item.type === 'place'));
  const nextPlace = nextDay?.items.find((item) => item.type === 'place');

  const totalDays = diffDaysInclusive(trip.startDate, trip.endDate);
  const totalNights = Math.max(totalDays - 1, 0);

  const newTripAction = (
    <Link
      href="/trips/new"
      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md"
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
          d="M12 4v16m8-8H4"
        />
      </svg>
      {t('newTrip')}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <TripTabHeader
        tripTitle={trip.title || ''}
        tripId={trip.travelId}
        backHref="/"
        action={newTripAction}
      />

      <main className="mx-auto max-w-5xl space-y-5 px-6 py-6">
        {/* 여행 기간 */}
        <section className="overflow-hidden rounded-2xl shadow-sm shadow-blue-100">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-3">
            <span className="text-sm font-medium text-blue-100">{t('period')}</span>
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-semibold text-white">
              {t('daysNights', { days: totalDays, nights: totalNights })}
            </span>
          </div>
          <div className="bg-white px-6 py-5">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {formatShortDate(trip.startDate)}
                </p>
                <p className="mt-0.5 text-sm text-gray-400">
                  {formatDayOfWeek(trip.startDate)} {trip.startDate}
                </p>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-indigo-200" />
                <svg
                  className="size-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-blue-200" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{formatShortDate(trip.endDate)}</p>
                <p className="mt-0.5 text-sm text-gray-400">
                  {formatDayOfWeek(trip.endDate)} {trip.endDate}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              {Array.from({ length: totalDays }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'block rounded-full transition-all',
                    i === 0 ? 'h-2 w-6 bg-blue-600' : 'size-2 bg-blue-200'
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 일정 하이라이트 */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{t('scheduleHighlight')}</h2>
            <Link
              href={`/trips/${trip.travelId}/itinerary`}
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
            >
              {t('view')}
              <svg
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {highlightDays.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">{t('noSchedule')}</p>
          ) : (
            <>
              {nextDay && nextPlace && nextPlace.type === 'place' && (
                <div className="mb-4 rounded-xl bg-blue-50/70 px-5 py-4">
                  <p className="text-xs font-medium text-blue-500">{t('nextSchedule')}</p>
                  <p className="mt-1 text-base font-bold text-gray-900">{nextPlace.name}</p>
                  <p className="mt-0.5 text-sm text-gray-400">
                    Day {nextDay.day} · {nextDay.dayOfWeek} {nextDay.shortDate}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {highlightDays.map((day) => {
                  const dayPlaces = day.items.filter((item) => item.type === 'place');
                  return (
                    <div
                      key={day.day}
                      className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                          {day.day}
                        </span>
                        <span className="text-xs text-gray-400">
                          {day.dayOfWeek} {day.shortDate}
                        </span>
                      </div>
                      {dayPlaces.length > 0 ? (
                        <>
                          <p className="font-medium text-gray-800 group-hover:text-blue-700">
                            {dayPlaces[0].name}
                          </p>
                          {dayPlaces.length > 1 && (
                            <p className="mt-0.5 text-xs text-gray-400">
                              {t('morePlaces', { count: dayPlaces.length - 1 })}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-gray-300">{t('noSchedule')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* 일행 + 가계부 & 기록 */}
        <div className="grid grid-cols-3 gap-5">
          <section className="col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{t('companions')}</h2>
            </div>
            <p className="text-sm text-gray-400">{t('companionsComingSoon')}</p>
          </section>

          <div className="col-span-1 flex flex-col gap-4">
            <section className="flex flex-1 flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">{t('budget')}</h2>
                <Link
                  href={`/trips/${trip.travelId}/budget`}
                  className="flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-700"
                >
                  {t('view')}
                  <svg
                    className="size-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-blue-600">₩0</p>
                <p className="mt-1 text-xs text-gray-400">{t('noBudget')}</p>
              </div>
            </section>

            <section className="flex flex-1 flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">{t('records')}</h2>
                <Link
                  href={`/trips/${trip.travelId}/records`}
                  className="flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-700"
                >
                  {t('view')}
                  <svg
                    className="size-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-800">0</p>
                <p className="mt-1 text-xs text-gray-400">{t('recordsAvailable')}</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  const t = useTranslations('trip.overview.empty');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-white px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-8 flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-inner">
          <svg
            className="size-14 text-blue-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.3}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
        <p
          className="mt-2 text-sm leading-relaxed text-gray-400"
          style={{ whiteSpace: 'pre-line' }}
        >
          {t('desc')}
        </p>
        <Link
          href="/trips/new"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
        >
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
