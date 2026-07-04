'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Header from '@/components/Header';
import {
  createCircleMarkerElement,
  createKakaoMap,
  createMarkerOverlay,
  loadKakaoMapsSdk,
  panTo,
  type KakaoCustomOverlay,
  type KakaoMap,
} from '@/lib/kakao-map';
import { usePlaceDetail, usePlaceList } from '@/hooks/use-place';
import type { Place, PlaceContentTypeId } from '@/types/place';
import { getMapViewport, onMapIdle } from './kakao-map-viewport';
import { PlaceCard } from './components/PlaceCard';
import {
  PlaceCategoryFilter,
  PLACE_CATEGORY_COLORS,
  PLACE_CATEGORY_EMOJIS,
} from './components/PlaceCategoryFilter';
import { PlaceDetailPanel } from './components/PlaceDetailPanel';

const BUSAN_CENTER = { lat: 35.1587, lng: 129.0756 };
const MAX_RADIUS = 20000;
const PAGE_SIZE = 20;
const EMPTY_PLACES: Place[] = [];

export default function PlacePage() {
  const [selectedCategory, setSelectedCategory] = useState<PlaceContentTypeId | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [viewport, setViewport] = useState({
    lat: BUSAN_CENTER.lat,
    lng: BUSAN_CENTER.lng,
    radius: MAX_RADIUS,
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const skipNextIdleRef = useRef(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const {
    data: listPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePlaceList({
    mapX: viewport.lng,
    mapY: viewport.lat,
    radius: viewport.radius,
    size: PAGE_SIZE,
    contentTypeId: selectedCategory ?? undefined,
  });
  const places = useMemo(
    () => listPages?.pages.flatMap((page) => page.places) ?? EMPTY_PLACES,
    [listPages],
  );

  const { data: detailResponse, isLoading: isDetailLoading } = usePlaceDetail(
    selectedPlace
      ? {
          contentId: selectedPlace.contentId,
          contentTypeId: selectedPlace.contentTypeId,
        }
      : null
  );

  // ── Kakao Maps SDK 로드 + 지도 이동 시 재검색 ──
  useEffect(() => {
    let cancelled = false;
    let unsubscribeIdle: (() => void) | null = null;

    loadKakaoMapsSdk().then(() => {
      if (cancelled || !mapRef.current) return;
      const map = createKakaoMap(mapRef.current, {
        center: BUSAN_CENTER,
        level: 8,
      });
      mapInstanceRef.current = map;
      setMapReady(true);

      unsubscribeIdle = onMapIdle(map, () => {
        if (skipNextIdleRef.current) {
          skipNextIdleRef.current = false;
          return;
        }

        const { center, radius } = getMapViewport(map);
        setViewport({
          lat: center.lat,
          lng: center.lng,
          radius: Math.min(Math.round(radius), MAX_RADIUS),
        });
      });
    });

    return () => {
      cancelled = true;
      unsubscribeIdle?.();
    };
  }, []);

  // ── 마커 렌더링 ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    places.forEach((place) => {
      const isSelected = selectedPlace?.contentId === place.contentId;
      const el = createCircleMarkerElement({
        content: PLACE_CATEGORY_EMOJIS[place.contentTypeId] ?? '📍',
        selected: isSelected,
      });
      el.style.background = PLACE_CATEGORY_COLORS[place.contentTypeId] ?? '#3b82f6';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedPlace(place);
      });

      const overlay = createMarkerOverlay(
        map,
        { lat: place.latitude, lng: place.longitude },
        el,
        isSelected ? 20 : 10
      );
      overlaysRef.current.push(overlay);
    });

    if (selectedPlace) {
      skipNextIdleRef.current = true;
      panTo(map, { lat: selectedPlace.latitude, lng: selectedPlace.longitude });
    }
  }, [mapReady, places, selectedPlace]);

  // ── 리스트 하단 도달 시 다음 페이지 로드 ──
  useEffect(() => {
    if (selectedPlace) return;

    const root = listContainerRef.current;
    const sentinel = listEndRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [selectedPlace, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Header />

      <PlaceCategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-[380px] shrink-0 flex-col overflow-hidden border-r border-gray-100 bg-white">
          {selectedPlace ? (
            <PlaceDetailPanel
              place={selectedPlace}
              detail={detailResponse}
              isLoading={isDetailLoading}
              onBack={() => setSelectedPlace(null)}
            />
          ) : (
            <div
              ref={listContainerRef}
              className="flex-1 space-y-2 overflow-y-auto p-3"
            >
              {places.map((place) => (
                <PlaceCard
                  key={place.contentId}
                  place={place}
                  isSelected={selectedPlace === place}
                  onClick={() => setSelectedPlace(place)}
                />
              ))}
              <div ref={listEndRef} />
              {isFetchingNextPage && (
                <p className="py-2 text-center text-xs text-gray-400">
                  불러오는 중...
                </p>
              )}
            </div>
          )}
        </aside>

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={mapRef}
            className="absolute inset-0"
          />

          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="mx-auto mb-2 size-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="text-sm text-gray-400">지도를 불러오는 중...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
