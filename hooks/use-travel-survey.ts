'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import {
  getTravelSurvey,
  saveTravelSurvey,
} from '@/features/onboarding/api/travel-survey';

export const travelSurveyQueryKey = ['travel-survey'] as const;

export function useTravelSurvey(enabled = true) {
  return useQuery({
    queryKey: travelSurveyQueryKey,
    queryFn: getTravelSurvey,
    enabled,
    retry: false,
  });
}

export function useSaveTravelSurvey() {
  return useMutation({ mutationFn: saveTravelSurvey });
}
