'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Clock, Copy, Globe, MapPin, Phone } from 'lucide-react';

import {
  createCircleMarkerElement,
  createKakaoMap,
  createMarkerOverlay,
  loadKakaoMapsSdk,
} from '@/lib/kakao-map';
import { cn } from '@/lib/utils';
import type { Place, PlaceDetailResponse } from '@/types/place';
import { PLACE_CATEGORY_LABELS } from './PlaceCategoryFilter';
import {
  LODGING_FIELD_ORDER,
  PLACE_DETAIL_FLAG_LABELS,
  PLACE_DETAIL_TEXT_LABELS,
  formatPlaceDetailValue,
  getBusinessHoursStatus,
  pickPlaceHours,
  pickPlacePhone,
  pickPlaceWebsite,
} from './place-detail-field-labels';

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
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
  const details = detail?.details ?? {};

  const phone = pickPlacePhone(details);
  const website = pickPlaceWebsite(details);
  const hours = pickPlaceHours(details);
  const hoursStatus = hours ? getBusinessHoursStatus(hours.value) : null;

  const highlightedKeys = new Set(
    [phone?.key, website?.key, hours?.key].filter((key): key is string => Boolean(key)),
  );

  const isLodging = place.contentTypeId === '32';
  const detailKeys = Object.keys(details).filter(
    (key) =>
      PLACE_DETAIL_TEXT_LABELS[key] &&
      !highlightedKeys.has(key) &&
      !PLACE_DETAIL_FLAG_LABELS[key],
  );
  const orderedDetailKeys = isLodging
    ? [
        ...LODGING_FIELD_ORDER.filter((key) => detailKeys.includes(key)),
        ...detailKeys.filter((key) => !LODGING_FIELD_ORDER.includes(key)),
      ]
    : detailKeys;

  const activeFlagEntries = Object.entries(details).filter(
    ([key, value]) => PLACE_DETAIL_FLAG_LABELS[key] && value === '1',
  );

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

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

      <div className="flex-1">
        {isLoading && (
          <p className="px-4 pt-4 text-sm text-gray-400">
            상세 정보를 불러오는 중...
          </p>
        )}

        <div className="divide-y divide-gray-100 border-b border-gray-100">
          {hours && (
            <InfoRow icon={<Clock className="size-4" />}>
              {hoursStatus ? (
                <p className="text-sm">
                  <span
                    className={cn(
                      'font-medium',
                      hoursStatus.isOpen ? 'text-green-600' : 'text-gray-400',
                    )}
                  >
                    {hoursStatus.label}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-gray-700">{hours.value}</p>
              )}
            </InfoRow>
          )}

          {website && (
            <InfoRow icon={<Globe className="size-4" />}>
              <a
                href={website.value}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-blue-600 hover:underline"
              >
                {website.value}
              </a>
            </InfoRow>
          )}

          <InfoRow icon={<MapPin className="size-4" />}>
            <p className="text-sm text-gray-700">{place.address}</p>
          </InfoRow>

          {phone && (
            <InfoRow icon={<Phone className="size-4" />}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-700">{phone.value}</p>
                <button
                  type="button"
                  onClick={() => handleCopy('phone', phone.value)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  {copiedField === 'phone' ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  복사
                </button>
              </div>
            </InfoRow>
          )}
        </div>

        <div className="p-4">
          {orderedDetailKeys.length > 0 && (
            <div className="space-y-1.5">
              {orderedDetailKeys.map((key) => (
                <p key={key} className="whitespace-pre-line text-sm text-gray-600">
                  <span className="text-gray-400">
                    {PLACE_DETAIL_TEXT_LABELS[key]}
                  </span>{' '}
                  {formatPlaceDetailValue(details[key])}
                </p>
              ))}
            </div>
          )}

          {activeFlagEntries.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                부대시설
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activeFlagEntries.map(([key]) => (
                  <span
                    key={key}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                  >
                    {PLACE_DETAIL_FLAG_LABELS[key]}
                  </span>
                ))}
              </div>
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
    </div>
  );
}

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
