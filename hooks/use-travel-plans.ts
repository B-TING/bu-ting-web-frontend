'use client';

import { useQuery } from '@tanstack/react-query';

import { getTravelPlans } from '@/api/travel';

export function useTravelPlans(travelId: string) {
  return useQuery({
    queryKey: ['travel-plans', travelId],
    queryFn: () => getTravelPlans(travelId),
    enabled: !!travelId,
  });
}
