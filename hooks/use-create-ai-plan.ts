'use client';

import { useMutation } from '@tanstack/react-query';

import { createAiPlan } from '@/api/travel';
import type { AiPlanCreateRequest } from '@/types/travel';

export function useCreateAiPlan(travelId: string) {
  return useMutation({
    mutationFn: (request: AiPlanCreateRequest) => createAiPlan(travelId, request),
  });
}
