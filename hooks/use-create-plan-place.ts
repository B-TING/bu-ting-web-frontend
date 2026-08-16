'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlanPlace } from '@/api/travel';
import type { PlanPlaceCreateRequest } from '@/types/travel';

export function useCreatePlanPlace(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, request }: { planId: string; request: PlanPlaceCreateRequest }) =>
      createPlanPlace(planId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-plans', travelId] });
    },
  });
}
