'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TripTabHeader } from '../../components/TripTabHeader';
import type { PlaceItem, DayItinerary, ItineraryItem } from '@/types/itinerary';
import { RebootFab } from '../../components/RebootFab';
import { RebootModal } from '../../components/RebootModal';
import { TransitIcon } from '../../components/TransitIcon';

declare global {
  interface Window {
    kakao: any;
  }
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_TRIP: { title: string; days: DayItinerary[] } = {
  title: 'B-Side of Busan',
  days: [
    {
      day: 1,
      date: '2026-06-25',
      shortDate: '6/25',
      dayOfWeek: '목',
      estimatedDuration: '4시간 39분',
      items: [
        {
          type: 'place',
          id: 'p1',
          order: 1,
          name: '해운대 해수욕장',
          category: '해변',
          placeType: '관광명소',
          time: '09:00 - 18:00',
          description: '대표 해수욕장으로 산책·야경·해산물 맛집이 가깝습니다.',
          stayMinutes: 120,
          address: '부산광역시 해운대구 해운대해변로',
          lat: 35.1587,
          lng: 129.1604,
        },
        { type: 'transit', mode: 'public', minutes: 19, km: 3.8 },
        {
          type: 'place',
          id: 'p2',
          order: 2,
          name: '광안리',
          category: '해변·야경',
          placeType: '관광명소',
          time: '09:00 - 18:00',
          description: '광안대교 야경과 함께 즐기기 좋은 해변 산책 코스입니다.',
          stayMinutes: 90,
          address: '부산광역시 수영구 광안해변로',
          lat: 35.1533,
          lng: 129.1186,
        },
        { type: 'transit', mode: 'car', minutes: 35, km: 11.7 },
        {
          type: 'place',
          id: 'p3',
          order: 3,
          name: '태종대',
          category: '관광지',
          placeType: '자연',
          time: '09:00 - 18:00',
          description: '태종대 전망대에서 바다를 조망할 수 있는 부산 대표 자연 명소입니다.',
          stayMinutes: 120,
          address: '부산광역시 영도구 전망로',
          lat: 35.05,
          lng: 129.0852,
        },
      ],
    },
    {
      day: 2,
      date: '2026-06-26',
      shortDate: '6/26',
      dayOfWeek: '금',
      estimatedDuration: '3시간 20분',
      items: [
        {
          type: 'place',
          id: 'p4',
          order: 1,
          name: '자갈치시장',
          category: '시장',
          placeType: '음식',
          time: '08:00 - 22:00',
          description: '부산의 대표 수산시장. 신선한 해산물을 저렴하게 즐길 수 있어요.',
          stayMinutes: 90,
          address: '부산광역시 중구 자갈치해안로',
          lat: 35.0977,
          lng: 129.0302,
        },
        { type: 'transit', mode: 'walk', minutes: 10, km: 0.7 },
        {
          type: 'place',
          id: 'p5',
          order: 2,
          name: '국제시장',
          category: '시장·쇼핑',
          placeType: '쇼핑',
          time: '10:00 - 20:00',
          description: '한국전쟁 당시 형성된 부산의 역사적인 전통시장입니다.',
          stayMinutes: 60,
          address: '부산광역시 중구 신창동',
          lat: 35.0996,
          lng: 129.0269,
        },
        { type: 'transit', mode: 'car', minutes: 20, km: 4.2 },
        {
          type: 'place',
          id: 'p6',
          order: 3,
          name: '감천문화마을',
          category: '문화',
          placeType: '관광명소',
          time: '09:00 - 18:00',
          description: '알록달록한 벽화와 골목길이 있는 부산의 마추픽추.',
          stayMinutes: 90,
          address: '부산광역시 사하구 감내2로',
          lat: 35.0974,
          lng: 129.0102,
        },
      ],
    },
    {
      day: 3,
      date: '2026-06-27',
      shortDate: '6/27',
      dayOfWeek: '토',
      estimatedDuration: '2시간 15분',
      items: [
        {
          type: 'place',
          id: 'p7',
          order: 1,
          name: '용두산 공원',
          category: '공원',
          placeType: '자연',
          time: '00:00 - 24:00',
          description: '부산타워가 있는 공원. 시내 전경을 한눈에 볼 수 있어요.',
          stayMinutes: 60,
          address: '부산광역시 중구 용두산길',
          lat: 35.1,
          lng: 129.0328,
        },
        { type: 'transit', mode: 'car', minutes: 20, km: 5.2 },
        {
          type: 'place',
          id: 'p8',
          order: 2,
          name: '범어사',
          category: '사찰',
          placeType: '문화',
          time: '06:00 - 18:00',
          description: '신라시대에 창건된 천년 고찰. 금정산 자락에 위치합니다.',
          stayMinutes: 75,
          address: '부산광역시 금정구 청룡동',
          lat: 35.2803,
          lng: 129.0821,
        },
      ],
    },
  ],
};

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

  const [days, setDays] = useState<DayItinerary[]>(MOCK_TRIP.days);
  const [activeDay, setActiveDay] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(new Set());
  const [quickRatings, setQuickRatings] = useState<Record<string, number>>({});
  const [reviewModal, setReviewModal] = useState<PlaceItem | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [rebootOpen, setRebootOpen] = useState(() => searchParams.get('reboot') === '1');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const currentDay = days.find((d) => d.day === activeDay)!;
  const places = currentDay.items.filter((i): i is PlaceItem => i.type === 'place');

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

  const toggleVisit = (id: string) =>
    setVisitedPlaces((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const t = useTranslations('trip.itinerary');

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
          tripTitle={MOCK_TRIP.title}
          tripId={tripId}
          backHref="/trips"
        />

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <aside className="flex w-[380px] shrink-0 flex-col border-r border-gray-100 bg-white">
            {/* Day tabs */}
            <div className="flex shrink-0 gap-2 border-b border-gray-100 px-4 py-3">
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
            </div>

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
                    {/* Naver map thumbnail placeholder — 추후 지도 미리보기 */}
                    <div className="mb-4 flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-400">{t('mapPreview')}</p>
                        <p className="mt-0.5 text-xs text-gray-300">{t('mapApiComingSoon')}</p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{selectedPlace.name}</h3>
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
                        {visitedPlaces.has(selectedPlace.id) ? t('visitDone') : t('visitDoneShort')}
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

                    <Link
                      href={`/places/${selectedPlace.id}`}
                      className="mt-3 inline-block text-xs text-blue-500 hover:text-blue-700"
                    >
                      {t('placeDetail')}
                    </Link>

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
      <RebootModal
        open={rebootOpen}
        onClose={() => setRebootOpen(false)}
        day={currentDay}
        onApply={applyRebootItems}
      />
    </>
  );
}
