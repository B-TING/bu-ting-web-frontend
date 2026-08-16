'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTravelPlan } from '@/api/travel';
import type { PlanCreateRequest } from '@/types/travel';

export function useCreatePlan(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PlanCreateRequest) => createTravelPlan(travelId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-plans', travelId] });
    },
  });
}
