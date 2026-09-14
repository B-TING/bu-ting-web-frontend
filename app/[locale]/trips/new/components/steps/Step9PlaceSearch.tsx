'use client';

import { useState } from 'react';
import { usePlaceSearch } from '@/hooks/use-place';
import type { PlaceContentTypeId } from '@/types/place';
import type { SelectedPlace, TripWizardData } from '@/types/tripWizard';

const CONTENT_TYPE_TO_SELECTED_PLACE_TYPE: Record<PlaceContentTypeId, SelectedPlace['type']> = {
  '12': 'TOURIST_SPOT',
  '14': 'CULTURE',
  '15': 'FESTIVAL',
  '25': 'COURSE',
  '28': 'LEISURE_SPORTS',
  '32': 'ACCOMMODATION',
  '38': 'SHOPPING',
  '39': 'RESTAURANT',
};

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step9PlaceSearch({ data, onChange }: Props) {
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const placeSearchQuery = usePlaceSearch(keyword);

  const toggle = (place: {
    contentId: string;
    contentTypeId: PlaceContentTypeId;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    const exists = data.selectedPlaces.some((p) => p.providerPlaceId === place.contentId);
    const next = exists
      ? data.selectedPlaces.filter((p) => p.providerPlaceId !== place.contentId)
      : [
          ...data.selectedPlaces,
          {
            provider: 'GOOGLE' as const,
            providerPlaceId: place.contentId,
            placeName: place.title,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            type: CONTENT_TYPE_TO_SELECTED_PLACE_TYPE[place.contentTypeId],
          },
        ];
    onChange({ selectedPlaces: next });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setKeyword(searchText.trim());
          }}
          placeholder="가고 싶은 부산 장소 검색"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400"
        />
        <button
          type="button"
          disabled={!searchText.trim()}
          onClick={() => setKeyword(searchText.trim())}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          검색
        </button>
      </div>

      {data.selectedPlaces.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.selectedPlaces.map((place) => (
            <button
              key={place.providerPlaceId}
              type="button"
              onClick={() =>
                onChange({
                  selectedPlaces: data.selectedPlaces.filter(
                    (p) => p.providerPlaceId !== place.providerPlaceId
                  ),
                })
              }
              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600"
            >
              {place.placeName} ×
            </button>
          ))}
        </div>
      )}

      {placeSearchQuery.isPending && keyword && (
        <p className="text-xs text-gray-400">장소를 검색하는 중입니다.</p>
      )}
      {placeSearchQuery.isError && (
        <p className="text-xs text-red-500">검색 결과를 불러오지 못했습니다.</p>
      )}
      {placeSearchQuery.data && (
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {placeSearchQuery.data.places.map((place) => {
            const selected = data.selectedPlaces.some((p) => p.providerPlaceId === place.contentId);
            return (
              <button
                key={place.contentId}
                type="button"
                onClick={() => toggle(place)}
                className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left ${
                  selected ? 'bg-blue-50' : 'bg-gray-50 hover:bg-blue-50/60'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-gray-800">
                    {place.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-gray-400">
                    {place.address}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-blue-600">
                  {selected ? '선택됨' : '선택'}
                </span>
              </button>
            );
          })}
          {placeSearchQuery.data.places.length === 0 && (
            <p className="py-3 text-center text-xs text-gray-400">검색 결과가 없어요.</p>
          )}
        </div>
      )}
    </div>
  );
}
