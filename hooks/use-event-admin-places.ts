'use client';
import { useQuery } from '@tanstack/react-query';
import { searchAdminTourPlaces } from '@/api/event-admin-places';

export function useEventAdminPlaces(keyword: string, page: number) {
  return useQuery({
    queryKey: ['event-admin-place-search', keyword.trim(), page],
    queryFn: () => searchAdminTourPlaces(keyword, page),
    enabled: keyword.trim().length > 0,
    staleTime: 60_000,
    retry: false,
  });
}
