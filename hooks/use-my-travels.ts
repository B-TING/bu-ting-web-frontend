'use client';

import { useQuery } from '@tanstack/react-query';

import { getMyTravels } from '@/api/travel-team';

export function useMyTravels() {
  return useQuery({
    queryKey: ['my-travels'],
    queryFn: getMyTravels,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}
