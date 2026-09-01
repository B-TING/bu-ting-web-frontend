'use client';

import { use, useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TripTabHeader } from '../../components/TripTabHeader';
import type { PlaceItem, DayItinerary, ItineraryItem } from '@/types/itinerary';
import { RebootFab } from '../../components/RebootFab';
import { RebootModal } from '../../components/RebootModal';
import { TransitIcon } from '../../components/TransitIcon';
import { useTravelPlans } from '@/hooks/use-travel-plans';
import { useMyTravels } from '@/hooks/use-my-travels';
import { useCreatePlanPlace } from '@/hooks/use-create-plan-place';
import { usePlaceDetail, usePlaceSearch } from '@/hooks/use-place';
import { useCreatePlan } from '@/hooks/use-create-plan';
import { useUpdatePlanPlaceVisited } from '@/hooks/use-update-plan-place-visited';
import { mapTravelPlansResponseToDays } from '@/lib/travel-plans-to-itinerary';
import type { Place, PlaceDetailResponse } from '@/types/place';

declare global {
  interface Window {
    kakao: any;
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getTravelDates(startDate: string, endDate: string) {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current <= end) {
    const localDate = new Date(current.getTime() - current.getTimezoneOffset() * 60_000);
    dates.push(localDate.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState(0);
  const cls = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange?.(star)}
          className={cn(
            cls,
            'leading-none transition-colors',
            (hovered || value) >= star ? 'text-yellow-400' : 'text-gray-200',
            onChange ? 'cursor-pointer' : 'cursor-default'
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ tripId: string }>;
}

export default function TripItineraryPage({ params }: Props) {
  const { tripId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('trip.itinerary');

  const plansQuery = useTravelPlans(tripId);
  const travelsQuery = useMyTravels();
  const createPlan = useCreatePlan(tripId);
  const createPlanPlace = useCreatePlanPlace(tripId);
  const updateVisited = useUpdatePlanPlaceVisited();

  const [days, setDays] = useState<DayItinerary[]>([]);
  const [syncedTravelId, setSyncedTravelId] = useState(tripId);
  const [activeDay, setActiveDay] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(new Set());
  // 개요에서 이미 캐시된 plans 데이터로 진입해도 첫 렌더에서 days 변환이 실행되어야 한다.
  const [syncedPlansData, setSyncedPlansData] = useState<typeof plansQuery.data | undefined>(
    undefined
  );
  const [quickRatings, setQuickRatings] = useState<Record<string, number>>({});
  const [reviewModal, setReviewModal] = useState<PlaceItem | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [rebootOpen, setRebootOpen] = useState(() => searchParams.get('reboot') === '1');
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [newDayDate, setNewDayDate] = useState('');
  const [targetPlanId, setTargetPlanId] = useState<string | null>(null);
  const [placeSearchText, setPlaceSearchText] = useState('');
  const [placeKeyword, setPlaceKeyword] = useState('');
  const placeSearchQuery = usePlaceSearch(placeKeyword);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const currentDay = days.find((d) => d.day === activeDay);
  const places = currentDay
    ? currentDay.items.filter((i): i is PlaceItem => i.type === 'place')
    : [];
  const travel = travelsQuery.data?.find((item) => item.travelId === tripId);
  const travelDates = useMemo(
    () => (travel ? getTravelDates(travel.startDate, travel.endDate) : []),
    [travel]
  );
  const selectedExistingDay = days.find((day) => day.date === newDayDate);
  const selectedPlaceImageQuery = usePlaceSearch(selectedPlace?.name ?? '');
  const selectedPlaceImage = selectedPlaceImageQuery.data?.places.find(
    (place) =>
      place.contentId === selectedPlace?.providerPlaceId || place.title === selectedPlace?.name
  );

  // ── 장소 상세(관광공사 detail + Google 리뷰): "상세 보기"를 눌렀을 때만 조회 ──
  // contentTypeId는 일정 데이터에 없어 검색 결과(selectedPlaceImage)에서 가져온다.
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  useEffect(() => {
    setShowPlaceDetail(false);
  }, [selectedPlace?.id]);
  const placeDetailQuery = usePlaceDetail(
    showPlaceDetail && selectedPlaceImage
      ? {
          contentId: selectedPlaceImage.contentId,
          contentTypeId: selectedPlaceImage.contentTypeId,
          googleSearchText: selectedPlace?.name,
        }
      : null
  );

  if (syncedTravelId !== tripId) {
    setSyncedTravelId(tripId);
    setSyncedPlansData(undefined);
    setDays([]);
    setActiveDay(1);
    setSelectedPlace(null);
    setVisitedPlaces(new Set());
  }

  // ── 서버에서 받아온 일정을 로컬 편집 상태(리부트 적용용)로 동기화 ──
  // (렌더 중 상태를 조정하는 React 권장 패턴: https://react.dev/learn/you-might-not-need-an-effect)
  if (plansQuery.data && plansQuery.data !== syncedPlansData) {
    setSyncedPlansData(plansQuery.data);
    const mappedDays = mapTravelPlansResponseToDays(plansQuery.data);
    setDays(mappedDays);
    setActiveDay((prev) =>
      mappedDays.some((d) => d.day === prev) ? prev : (mappedDays[0]?.day ?? 1)
    );
    const visitedPlanPlaceIds = new Set<string>();
    plansQuery.data.days.forEach((day) => {
      day.places.forEach((place) => {
        if (place.visited) visitedPlanPlaceIds.add(place.planPlaceId);
      });
    });
    setVisitedPlaces((prev) => new Set([...prev, ...visitedPlanPlaceIds]));
  }

  // ── FAB에서 ?reboot=1로 넘어온 경우, 초기 렌더에서 모달을 연 뒤 쿼리스트링만 정리 ──
  useEffect(() => {
    if (searchParams.get('reboot') === '1') {
      router.replace(`/trips/${tripId}/itinerary`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const applyRebootItems = (nextItems: ItineraryItem[]) => {
    setDays((prev) => prev.map((d) => (d.day === activeDay ? { ...d, items: nextItems } : d)));
  };

  // ── Kakao Maps SDK 로드 (useEffect 방식 — next/script onLoad 타이밍 문제 회피) ──
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_API_KEY}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(35.1587, 129.0756),
          level: 8,
        });
        setMapReady(true);
      });
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // ── Render markers + polyline whenever day / selection / visit state changes ──
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    // Clear previous overlays
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const path: any[] = [];

    places.forEach((place) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      path.push(position);

      const isSelected = selectedPlace?.id === place.id;
      const isVisited = visitedPlaces.has(place.id);
      const bg = isSelected ? '#1d4ed8' : isVisited ? '#22c55e' : '#3b82f6';
      const ring = isSelected ? '3px solid #93c5fd' : '2px solid white';
      const size = isSelected ? '38px' : '30px';
      const shadow = isSelected ? '0 4px 14px rgba(59,130,246,0.55)' : '0 2px 6px rgba(0,0,0,0.25)';

      const el = document.createElement('div');
      Object.assign(el.style, {
        width: size,
        height: size,
        background: bg,
        borderRadius: '50%',
        border: ring,
        boxShadow: shadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.2s',
        userSelect: 'none',
        zIndex: isSelected ? '20' : '10',
      });
      el.textContent = String(place.order);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedPlace((prev) => (prev?.id === place.id ? null : place));
      });

      // Label tooltip for selected
      if (isSelected) {
        const label = document.createElement('div');
        Object.assign(label.style, {
          position: 'absolute',
          bottom: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1d4ed8',
          color: 'white',
          fontSize: '11px',
          fontWeight: '600',
          padding: '3px 8px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        });
        label.textContent = place.name;
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.appendChild(el);
        wrapper.appendChild(label);

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content: wrapper,
          zIndex: 20,
        });
        overlay.setMap(mapInstanceRef.current);
        overlaysRef.current.push(overlay);
      } else {
        const overlay = new window.kakao.maps.CustomOverlay({ position, content: el, zIndex: 10 });
        overlay.setMap(mapInstanceRef.current);
        overlaysRef.current.push(overlay);
      }
    });

    // Polyline
    if (path.length > 1) {
      polylineRef.current = new window.kakao.maps.Polyline({
        path,
        strokeWeight: 3,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.6,
        strokeStyle: 'dashed',
      });
      polylineRef.current.setMap(mapInstanceRef.current);
    }

    // Fit bounds or pan to selected
    if (selectedPlace) {
      mapInstanceRef.current.panTo(
        new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng)
      );
    } else if (path.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(p));
      mapInstanceRef.current.setBounds(bounds, 80, 80, 80, 80);
    }
  }, [mapReady, activeDay, selectedPlace, visitedPlaces, places]);

  const toggleVisit = (id: string) => {
    const nextVisited = !visitedPlaces.has(id);
    setVisitedPlaces((prev) => {
      const next = new Set(prev);
      if (nextVisited) next.add(id);
      else next.delete(id);
      return next;
    });
    if (UUID_PATTERN.test(id)) {
      updateVisited.mutate({ planPlaceId: id, visited: nextVisited });
    }
  };

  const handleAddDay = () => {
    if (!newDayDate || !travelDates.includes(newDayDate)) return;

    if (selectedExistingDay) {
      const existingPlan = plansQuery.data?.days.find((day) => day.visitDate === newDayDate);
      if (!existingPlan) return;
      setActiveDay(selectedExistingDay.day);
      setSelectedPlace(null);
      setTargetPlanId(existingPlan.planId);
      return;
    }

    const dayNumber = travelDates.indexOf(newDayDate) + 1;
    createPlan.mutate(
      { dayNumber, visitDate: newDayDate },
      {
        onSuccess: (plan) => {
          setActiveDay(dayNumber);
          setTargetPlanId(plan.planId);
        },
      }
    );
  };

  const closePlaceAdd = () => {
    setAddDayOpen(false);
    setNewDayDate('');
    setTargetPlanId(null);
    setPlaceSearchText('');
    setPlaceKeyword('');
  };

  const handleAddPlace = (place: Place) => {
    if (!targetPlanId) return;
    createPlanPlace.mutate(
      {
        planId: targetPlanId,
        request: {
          placeName: place.title,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          provider: 'GOOGLE',
          providerPlaceId: place.contentId,
          visited: false,
        },
      },
      { onSuccess: closePlaceAdd }
    );
  };

  const openReview = (place: PlaceItem) => {
    setReviewModal(place);
    setReviewRating(0);
    setReviewText('');
  };

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-white">
        {/* ── Header ── */}
        <TripTabHeader
          tripTitle={plansQuery.data?.title ?? ''}
          tripId={tripId}
          backHref="/trips"
        />

        {plansQuery.isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-gray-400">{t('loading')}</p>
          </div>
        ) : plansQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-red-500">{t('loadError')}</p>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left panel */}
            <aside className="flex w-[380px] shrink-0 flex-col border-r border-gray-100 bg-white">
              {/* Day tabs */}
              <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
                {days.map((d) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => {
                      setActiveDay(d.day);
                      setSelectedPlace(null);
                    }}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                      activeDay === d.day
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}
                  >
                    {d.dayOfWeek} {d.shortDate}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAddDayOpen((v) => !v)}
                  aria-label={t('addDay')}
                  className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  +
                </button>
              </div>

              {addDayOpen && (
                <div className="shrink-0 space-y-2 border-b border-gray-100 px-4 py-3">
                  {!targetPlanId ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={newDayDate}
                        onChange={(e) => setNewDayDate(e.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400"
                        disabled={travelDates.length === 0}
                      >
                        <option value="">
                          {travelDates.length === 0
                            ? '여행 날짜를 불러오지 못했습니다'
                            : '장소를 추가할 여행 날짜 선택'}
                        </option>
                        {travelDates.map((date) => {
                          const hasPlan = days.some((day) => day.date === date);
                          return (
                            <option
                              key={date}
                              value={date}
                            >
                              {date}
                              {hasPlan ? ' · 일정 있음' : ' · 새 일정'}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="button"
                        disabled={
                          !newDayDate || !travelDates.includes(newDayDate) || createPlan.isPending
                        }
                        onClick={handleAddDay}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                      >
                        다음
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          value={placeSearchText}
                          onChange={(e) => setPlaceSearchText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setPlaceKeyword(placeSearchText.trim());
                          }}
                          placeholder="추가할 부산 장소 검색"
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400"
                        />
                        <button
                          type="button"
                          disabled={!placeSearchText.trim()}
                          onClick={() => setPlaceKeyword(placeSearchText.trim())}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          검색
                        </button>
                        <button
                          type="button"
                          onClick={closePlaceAdd}
                          className="px-1 text-xs text-gray-400"
                        >
                          닫기
                        </button>
                      </div>
                      {placeSearchQuery.isPending && placeKeyword && (
                        <p className="text-xs text-gray-400">장소를 검색하는 중입니다.</p>
                      )}
                      {placeSearchQuery.isError && (
                        <p className="text-xs text-red-500">검색 결과를 불러오지 못했습니다.</p>
                      )}
                      {placeSearchQuery.data && (
                        <div className="max-h-44 space-y-1 overflow-y-auto">
                          {placeSearchQuery.data.places.map((place) => (
                            <button
                              key={place.contentId}
                              type="button"
                              disabled={createPlanPlace.isPending}
                              onClick={() => handleAddPlace(place)}
                              className="flex w-full items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-left hover:bg-blue-50 disabled:opacity-50"
                            >
                              {place.thumbnailUrl || place.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={place.thumbnailUrl || place.imageUrl}
                                  alt=""
                                  className="size-10 shrink-0 rounded-md object-cover"
                                />
                              ) : (
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[10px] text-gray-400">
                                  이미지 없음
                                </span>
                              )}
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-gray-800">
                                  {place.title}
                                </span>
                                <span className="mt-0.5 block truncate text-[11px] text-gray-400">
                                  {place.address}
                                </span>
                              </span>
                              <span className="shrink-0 text-xs font-medium text-blue-600">
                                {createPlanPlace.isPending ? '추가 중…' : '추가'}
                              </span>
                            </button>
                          ))}
                          {placeSearchQuery.data.places.length === 0 && (
                            <p className="py-3 text-center text-xs text-gray-400">
                              검색 결과가 없습니다.
                            </p>
                          )}
                        </div>
                      )}
                      {createPlanPlace.isError && (
                        <p className="text-xs text-red-500">장소를 일정에 추가하지 못했습니다.</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {!currentDay ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-sm text-gray-400">{t('noDays')}</p>
                </div>
              ) : (
                <>
                  {/* Date + duration */}
                  <div className="flex shrink-0 items-center justify-between border-b border-gray-50 px-4 py-2.5">
                    <p className="text-sm font-semibold text-gray-800">
                      {currentDay.date} · Day {currentDay.day}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('estimatedDuration', { duration: currentDay.estimatedDuration })}
                    </p>
                  </div>

                  {/* Itinerary list */}
                  <div className="flex-1 overflow-y-auto px-3 py-3">
                    <div className="space-y-1">
                      {currentDay.items.map((item, idx) => {
                        if (item.type === 'transit') {
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 px-3 py-1"
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="h-2.5 w-px bg-gray-200" />
                                <div className="flex size-5 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                  <TransitIcon mode={item.mode} />
                                </div>
                                <div className="h-2.5 w-px bg-gray-200" />
                              </div>
                              <div className="flex flex-1 items-center justify-between">
                                <span className="text-xs text-gray-400">
                                  {t(`transit.${item.mode}`)} ·{' '}
                                  {t('transitInfo', { minutes: item.minutes, km: item.km })}
                                </span>
                                <button
                                  type="button"
                                  className="text-xs text-blue-500 hover:text-blue-700"
                                >
                                  {t('navigate')}
                                </button>
                              </div>
                            </div>
                          );
                        }

                        const isVisited = visitedPlaces.has(item.id);
                        const isSelected = selectedPlace?.id === item.id;
                        const rating = quickRatings[item.id] ?? 0;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'cursor-pointer rounded-xl border p-4 transition-all',
                              isSelected
                                ? 'border-blue-300 bg-blue-50/50 shadow-sm shadow-blue-100'
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                            )}
                            onClick={() => setSelectedPlace(isSelected ? null : item)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={cn(
                                    'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                                    isSelected
                                      ? 'bg-blue-700'
                                      : isVisited
                                        ? 'bg-green-500'
                                        : 'bg-blue-500'
                                  )}
                                >
                                  {item.order}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {item.time} · {item.category}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:border-gray-300"
                              >
                                {t('edit')}
                              </button>
                            </div>

                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
                              {item.description}
                            </p>

                            <div
                              className="mt-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => toggleVisit(item.id)}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={cn(
                                    'flex size-4 items-center justify-center rounded-full border-2 transition-all',
                                    isVisited
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300 hover:border-blue-400'
                                  )}
                                >
                                  {isVisited && (
                                    <svg
                                      className="size-2.5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    'text-xs',
                                    isVisited ? 'font-medium text-blue-600' : 'text-gray-400'
                                  )}
                                >
                                  {isVisited ? t('visitDone') : t('visitCheck')}
                                </span>
                              </button>

                              {isVisited && (
                                <div className="mt-2.5 space-y-2.5">
                                  <button
                                    type="button"
                                    onClick={() => openReview(item)}
                                    className="w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-100 transition-all hover:bg-blue-700"
                                  >
                                    {t('addRecord')}
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <StarRating
                                      value={rating}
                                      onChange={(v) =>
                                        setQuickRatings((prev) => ({ ...prev, [item.id]: v }))
                                      }
                                      size="sm"
                                    />
                                    <span className="text-xs text-gray-400">{t('ratingOnly')}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </aside>

            {/* ── Map area ── */}
            <div className="relative flex-1 overflow-hidden">
              {/* Kakao Map container */}
              <div
                ref={mapRef}
                className="absolute inset-0"
              />

              {/* Loading state */}
              {!mapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="mx-auto mb-2 size-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="text-sm text-gray-400">{t('mapLoading')}</p>
                  </div>
                </div>
              )}

              {/* ── Place detail panel ── */}
              <div
                className={cn(
                  'absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl bg-white shadow-2xl shadow-gray-900/20 transition-transform duration-300 ease-out',
                  selectedPlace ? 'translate-y-0' : 'translate-y-full'
                )}
              >
                {selectedPlace && (
                  <>
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="h-1 w-10 rounded-full bg-gray-200" />
                    </div>
                    <div className="max-h-72 overflow-y-auto px-5 pb-6">
                      {selectedPlaceImage?.imageUrl || selectedPlaceImage?.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedPlaceImage.imageUrl || selectedPlaceImage.thumbnailUrl}
                          alt={selectedPlace.name}
                          className="mb-4 h-36 w-full rounded-2xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="mb-4 flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner">
                          <p className="text-xs font-semibold text-gray-400">이미지 없음</p>
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {selectedPlace.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {selectedPlace.placeType} · {selectedPlace.category}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPlace(null)}
                          className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleVisit(selectedPlace.id)}
                          className={cn(
                            'flex-1 rounded-full border py-2 text-xs font-medium transition-all',
                            visitedPlaces.has(selectedPlace.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {visitedPlaces.has(selectedPlace.id)
                            ? t('visitDone')
                            : t('visitDoneShort')}
                        </button>
                        <button
                          type="button"
                          className="flex-1 rounded-full border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:border-gray-300"
                        >
                          {t('navigate')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openReview(selectedPlace)}
                          className="flex-1 rounded-full bg-blue-600 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
                        >
                          {t('leaveReview')}
                        </button>
                      </div>

                      <hr className="my-4 border-gray-100" />

                      <p className="text-sm leading-relaxed text-gray-600">
                        {selectedPlace.description}
                      </p>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs text-gray-400">
                          {t('stayMinutes', { minutes: selectedPlace.stayMinutes })}
                        </p>
                        <p className="text-xs text-gray-400">{selectedPlace.time}</p>
                        <p className="text-xs text-gray-400">{selectedPlace.address}</p>
                      </div>

                      {selectedPlaceImage && (
                        <div className="mt-3">
                          {!showPlaceDetail ? (
                            <button
                              type="button"
                              onClick={() => setShowPlaceDetail(true)}
                              className="text-xs font-medium text-blue-500 hover:text-blue-700"
                            >
                              {t('placeDetail')}
                            </button>
                          ) : placeDetailQuery.isPending ? (
                            <p className="text-xs text-gray-400">상세 정보를 불러오는 중…</p>
                          ) : placeDetailQuery.isError ? (
                            <p className="text-xs text-red-400">상세 정보를 불러오지 못했어요</p>
                          ) : (
                            <PlaceDetailInline detail={placeDetailQuery.data} />
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedPlace(null)}
                        className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {t('close')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReviewModal(null);
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{reviewModal.name}</h3>
                <p className="mt-0.5 text-xs text-gray-400">{reviewModal.placeType}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-5 flex flex-col items-center gap-2.5">
              <p className="text-sm text-gray-500">{t('reviewQuestion')}</p>
              <StarRating
                value={reviewRating}
                onChange={setReviewRating}
                size="lg"
              />
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t('reviewPlaceholder')}
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={reviewRating === 0 && reviewText.trim() === ''}
                onClick={() => {
                  if (reviewModal)
                    setQuickRatings((prev) => ({ ...prev, [reviewModal.id]: reviewRating }));
                  setReviewModal(null);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:shadow-none"
              >
                {t('saveRecord')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 리부트 ── */}
      <RebootFab
        tripId={tripId}
        onOpen={() => setRebootOpen(true)}
      />
      {currentDay && (
        <RebootModal
          open={rebootOpen}
          onClose={() => setRebootOpen(false)}
          day={currentDay}
          onApply={applyRebootItems}
        />
      )}
    </>
  );
}

const PLACE_DETAIL_FIELD_KO: Record<string, string> = {
  checkintime: '체크인',
  checkouttime: '체크아웃',
  parkinglodging: '주차',
  parking: '주차',
  reservationurl: '예약',
  infocenter: '문의',
  usetime: '이용시간',
  restdate: '휴무일',
};

function PlaceDetailInline({ detail }: { detail: PlaceDetailResponse | undefined }) {
  if (!detail) {
    return <p className="text-xs text-gray-400">상세 정보가 없어요</p>;
  }

  const googlePlace = detail.googlePlace;
  const detailEntries = Object.entries(detail.details ?? {}).filter(([, value]) => value);

  if (detailEntries.length === 0 && !googlePlace) {
    return <p className="text-xs text-gray-400">상세 정보가 없어요</p>;
  }

  return (
    <div className="space-y-3 rounded-xl bg-gray-50 p-3">
      {detailEntries.length > 0 && (
        <div className="space-y-1">
          {detailEntries.map(([key, value]) => (
            <p
              key={key}
              className="text-xs text-gray-600"
            >
              <span className="text-gray-400">{PLACE_DETAIL_FIELD_KO[key] ?? key}</span>{' '}
              {key === 'reservationurl' ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-blue-500 hover:underline"
                >
                  {value}
                </a>
              ) : (
                value
              )}
            </p>
          ))}
        </div>
      )}

      {googlePlace && (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-900">리뷰</span>
            <span className="text-xs font-medium text-yellow-500">
              ★ {googlePlace.rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-gray-400">
              ({googlePlace.reviewCount.toLocaleString()})
            </span>
          </div>

          {googlePlace.openingHours.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {googlePlace.openingHours.map((line) => (
                <p
                  key={line}
                  className="text-[11px] text-gray-500"
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          <div className="mt-2 space-y-2">
            {googlePlace.reviews.map((review) => (
              <div
                key={`${review.authorName}-${review.publishTime}`}
                className="rounded-lg bg-white p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-gray-700">{review.authorName}</p>
                  <p className="shrink-0 text-[11px] text-gray-400">
                    {review.relativePublishTimeDescription}
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-yellow-500">
                  {'★'.repeat(Math.max(0, Math.min(5, review.rating)))}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{review.text}</p>
              </div>
            ))}
            {googlePlace.reviews.length === 0 && (
              <p className="text-xs text-gray-400">등록된 리뷰가 없어요</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
