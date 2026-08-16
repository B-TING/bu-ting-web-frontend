'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getPlaceDetail, getPlaceList, searchPlaces } from '@/api/place-api';
import type { PlaceDetailRequest, PlaceListRequest } from '@/types/place';

type PlaceListSearchParams = Omit<PlaceListRequest, 'page'>;

export function usePlaceList(params: PlaceListSearchParams) {
  return useInfiniteQuery({
    queryKey: ['place-list', params],
    queryFn: ({ pageParam }) => getPlaceList({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.places.length,
        0,
      );
      return loadedCount < lastPage.totalCount ? allPages.length + 1 : undefined;
    },
  });
}

export function usePlaceDetail(request: PlaceDetailRequest | null) {
  return useQuery({
    queryKey: ['place-detail', request],
    queryFn: () => getPlaceDetail(request as PlaceDetailRequest),
    enabled: request !== null,
  });
}

export function usePlaceSearch(keyword: string) {
  return useQuery({
    queryKey: ['place-search', keyword],
    queryFn: () => searchPlaces({ keyword }),
    enabled: keyword.trim().length > 0,
  });
}
