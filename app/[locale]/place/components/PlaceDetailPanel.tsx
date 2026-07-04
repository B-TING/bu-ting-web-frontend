'use client';

import { useEffect, useRef } from 'react';

import {
  createCircleMarkerElement,
  createKakaoMap,
  createMarkerOverlay,
  loadKakaoMapsSdk,
} from '@/lib/kakao-map';
import type { Place, PlaceDetailResponse } from '@/types/place';
import { PLACE_CATEGORY_LABELS } from './PlaceCategoryFilter';

interface PlaceDetailPanelProps {
  place: Place;
  detail: PlaceDetailResponse | undefined;
  isLoading: boolean;
  onBack: () => void;
}

export function PlaceDetailPanel({
  place,
  detail,
  isLoading,
  onBack,
}: PlaceDetailPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadKakaoMapsSdk().then(() => {
      if (cancelled || !mapRef.current) return;

      const map = createKakaoMap(mapRef.current, {
        center: { lat: place.latitude, lng: place.longitude },
        level: 4,
      });
      const marker = createCircleMarkerElement({ content: '📍' });
      createMarkerOverlay(
        map,
        { lat: place.latitude, lng: place.longitude },
        marker,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [place.latitude, place.longitude]);

  const googlePlace = detail?.googlePlace;
  const detailEntries = detail ? Object.entries(detail.details) : [];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <svg
            className="size-5"
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
        </button>
        <h2 className="text-base font-bold text-gray-900">{place.title}</h2>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
          {PLACE_CATEGORY_LABELS[place.contentTypeId]}
        </span>
      </div>

      <div ref={mapRef} className="h-40 w-full shrink-0 bg-gray-100" />

      <div className="flex-1 p-4">
        <p className="text-sm text-gray-600">{place.address}</p>

        {isLoading && (
          <p className="mt-4 text-sm text-gray-400">
            상세 정보를 불러오는 중...
          </p>
        )}

        {detailEntries.length > 0 && (
          <div className="mt-4 space-y-1">
            {detailEntries.map(([key, value]) => (
              <p key={key} className="text-sm text-gray-600">
                <span className="text-gray-400">{key}</span> {value}
              </p>
            ))}
          </div>
        )}

        {googlePlace && (
          <div className="mt-5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">리뷰</h3>
              <span className="text-sm font-medium text-yellow-500">
                ★ {googlePlace.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({googlePlace.reviewCount.toLocaleString()})
              </span>
            </div>

            {googlePlace.openingHours.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {googlePlace.openingHours.map((line) => (
                  <p key={line} className="text-xs text-gray-500">
                    {line}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-3 space-y-3">
              {googlePlace.reviews.map((review) => (
                <div
                  key={`${review.authorName}-${review.publishTime}`}
                  className="rounded-xl bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">
                      {review.authorName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {review.relativePublishTimeDescription}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-yellow-500">
                    {'★'.repeat(review.rating)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
