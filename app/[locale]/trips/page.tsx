'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TripTabHeader } from './components/TripTabHeader';
import { useMyTravels } from '@/hooks/use-my-travels';
import { useTravelPlans } from '@/hooks/use-travel-plans';
import { useTravelExpenseSummary } from '@/hooks/use-travel-expenses';
import { mapTravelPlansResponseToDays } from '@/lib/travel-plans-to-itinerary';
import { diffDaysInclusive, formatDayOfWeek, formatShortDate } from '@/lib/format-date';
import type { MyTravelResponse } from '@/types/travel';
import {
  useCreateTravelInvite,
  useDeleteTravelInvite,
  useTravelInvite,
  useTravelMembers,
} from '@/hooks/use-travel-team';

export default function TripsPage() {
  const searchParams = useSearchParams();
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

  const allTravels = sortTravels(travels ?? []);
  const upcomingTrip = pickUpcomingTrip(allTravels);
  const selectedTravelId = searchParams.get('travelId');
  const selectedTrip =
    allTravels.find((trip) => trip.travelId === selectedTravelId) ?? upcomingTrip;

  if (allTravels.length === 0) return <EmptyState />;

  return selectedTrip ? (
    <TripOverview
      trip={selectedTrip}
      travels={allTravels}
      upcomingTripId={upcomingTrip?.travelId}
    />
  ) : (
    <TripsListOnly travels={allTravels} />
  );
}

function pickUpcomingTrip(travels: MyTravelResponse[]): MyTravelResponse | null {
  const today = getTodayDateString();
  const upcoming = travels
    .filter((trip) => trip.status !== 'COMPLETED' && trip.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (upcoming.length > 0) return upcoming[0];

  return travels.find((trip) => trip.status === 'IN_PROGRESS') ?? null;
}

function sortTravels(travels: MyTravelResponse[]) {
  const today = getTodayDateString();

  return travels.slice().sort((a, b) => {
    const rank = (trip: MyTravelResponse) => {
      if (trip.status === 'IN_PROGRESS') return 0;
      if (trip.status !== 'COMPLETED' && trip.startDate >= today) return 1;
      if (trip.status !== 'COMPLETED') return 2;
      return 3;
    };

    const rankDifference = rank(a) - rank(b);
    if (rankDifference !== 0) return rankDifference;

    return rank(a) === 3
      ? b.startDate.localeCompare(a.startDate)
      : a.startDate.localeCompare(b.startDate);
  });
}

function getTodayDateString() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
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

function TripOverview({
  trip,
  travels,
  upcomingTripId,
}: {
  trip: MyTravelResponse;
  travels: MyTravelResponse[];
  upcomingTripId?: string;
}) {
  const t = useTranslations('trip.overview');
  const plansQuery = useTravelPlans(trip.travelId);
  const expenseSummaryQuery = useTravelExpenseSummary(trip.travelId);

  const days = plansQuery.data ? mapTravelPlansResponseToDays(plansQuery.data) : [];
  const highlightDays = days.slice(0, 3);
  const nextDay = days.find((day) => day.items.some((item) => item.type === 'place'));
  const nextPlace = nextDay?.items.find((item) => item.type === 'place');

  const totalDays = diffDaysInclusive(trip.startDate, trip.endDate);
  const totalNights = Math.max(totalDays - 1, 0);
  const krwSummary = expenseSummaryQuery.data?.currencySummaries.find(
    (summary) => summary.currency === 'KRW'
  );

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
          <TravelTeamSection
            travelId={trip.travelId}
            isLeader={trip.role === 'LEADER'}
          />

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
                <p className="text-2xl font-bold text-blue-600">
                  ₩{(krwSummary?.totalAmount ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {expenseSummaryQuery.isPending
                    ? '가계부를 불러오는 중입니다.'
                    : krwSummary
                      ? `${expenseSummaryQuery.data?.expenseCount ?? 0}건의 지출`
                      : t('noBudget')}
                </p>
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

        <TripList
          travels={travels}
          featuredTravelId={upcomingTripId}
          selectedTravelId={trip.travelId}
        />
      </main>
    </div>
  );
}

function TripsListOnly({ travels }: { travels: MyTravelResponse[] }) {
  const t = useTranslations('trip.overview');
  const newTripAction = (
    <Link
      href="/trips/new"
      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      {t('newTrip')}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <TripTabHeader
        tripTitle="여행 목록"
        tripId={travels[0].travelId}
        backHref="/"
        action={newTripAction}
      />
      <main className="mx-auto max-w-5xl px-6 py-6">
        <TripList travels={travels} />
      </main>
    </div>
  );
}

function TripList({
  travels,
  featuredTravelId,
  selectedTravelId,
}: {
  travels: MyTravelResponse[];
  featuredTravelId?: string;
  selectedTravelId?: string;
}) {
  const tStatus = useTranslations('trip.status');

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">내 여행 목록</h2>
          <p className="mt-1 text-sm text-gray-400">참여 중인 여행 {travels.length}개</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {travels.map((travel) => {
          const isFeatured = travel.travelId === featuredTravelId;
          const isSelected = travel.travelId === selectedTravelId;
          return (
            <Link
              key={travel.travelId}
              href={`/trips?travelId=${travel.travelId}`}
              className={cn(
                'group rounded-xl border p-4 transition-all hover:border-blue-300 hover:shadow-sm',
                isSelected
                  ? 'border-blue-400 bg-blue-50/70 ring-1 ring-blue-200'
                  : 'border-gray-100 bg-white'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-gray-900 group-hover:text-blue-700">
                      {travel.title || '제목 없는 여행'}
                    </h3>
                    {isFeatured && (
                      <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        가장 가까운 여행
                      </span>
                    )}
                    {isSelected && !isFeatured && (
                      <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-white">
                        선택한 여행
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {travel.startDate} ~ {travel.endDate}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                    travel.status === 'COMPLETED'
                      ? 'bg-gray-100 text-gray-500'
                      : travel.status === 'IN_PROGRESS'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                  )}
                >
                  {tStatus(travel.status)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>{travel.role === 'LEADER' ? '내가 만든 여행' : '초대받은 여행'}</span>
                <span className="text-blue-500">상세 보기 →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function TravelTeamSection({ travelId, isLeader }: { travelId: string; isLeader: boolean }) {
  const t = useTranslations('trip.overview');
  const membersQuery = useTravelMembers(travelId);
  const inviteQuery = useTravelInvite(travelId, isLeader);
  const createInvite = useCreateTravelInvite(travelId);
  const deleteInvite = useDeleteTravelInvite(travelId);
  const invite = inviteQuery.data;
  const isMutating = createInvite.isPending || deleteInvite.isPending;

  const copyInvite = async () => {
    if (!invite?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(invite.inviteLink);
      toast.success('초대 링크를 복사했어요');
    } catch {
      toast.error('복사에 실패했어요. 링크를 직접 선택해 복사해 주세요.');
    }
  };

  return (
    <section className="col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">{t('companions')}</h2>
        {isLeader && !inviteQuery.isPending && (
          <button
            type="button"
            disabled={isMutating}
            onClick={() => (invite ? deleteInvite.mutate() : createInvite.mutate())}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              invite
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-blue-600 text-white hover:bg-blue-700',
              isMutating && 'cursor-not-allowed opacity-50'
            )}
          >
            {invite ? '초대 링크 폐기' : '초대 링크 만들기'}
          </button>
        )}
      </div>

      {membersQuery.isPending ? (
        <p className="text-sm text-gray-400">일행을 불러오는 중입니다.</p>
      ) : membersQuery.isError ? (
        <p className="text-sm text-red-500">일행을 불러오지 못했습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {(membersQuery.data ?? []).map((member) => (
            <div
              key={member.memberId}
              className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {member.nickname.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-medium text-gray-800">{member.nickname}</span>
              {member.role === 'LEADER' && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  방장
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {invite?.inviteLink && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <input
            readOnly
            value={invite.inviteLink}
            aria-label="초대 링크"
            className="min-w-0 flex-1 bg-transparent text-xs text-gray-600 outline-none"
          />
          <button
            type="button"
            onClick={copyInvite}
            className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm hover:bg-blue-50"
          >
            복사
          </button>
        </div>
      )}

      {(inviteQuery.isError || createInvite.isError || deleteInvite.isError) && (
        <p className="mt-3 text-xs text-red-500">초대 링크를 처리하지 못했습니다.</p>
      )}
    </section>
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
