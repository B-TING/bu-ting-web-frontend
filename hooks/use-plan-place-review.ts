'use client';

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPlanPlaceReview,
  deletePlanPlaceReview,
  getPlanPlaceReview,
  updatePlanPlaceReview,
} from '@/api/travel-review';
import type { PlanPlaceReviewRequest, PlanPlaceReviewResponse } from '@/types/review';

export function planPlaceReviewKey(travelId: string, planPlaceId: string) {
  return ['plan-place-review', travelId, planPlaceId] as const;
}

export function usePlanPlaceReview(travelId: string, planPlaceId: string) {
  return useQuery({
    queryKey: planPlaceReviewKey(travelId, planPlaceId),
    queryFn: () => getPlanPlaceReview(travelId, planPlaceId),
    enabled: Boolean(travelId && planPlaceId),
  });
}

/** 여러 장소의 후기를 한 번에 조회하고, planPlaceId → 후기 Map으로 합쳐서 반환한다. */
export function usePlanPlaceReviews(travelId: string, planPlaceIds: string[]) {
  return useQueries({
    queries: planPlaceIds.map((planPlaceId) => ({
      queryKey: planPlaceReviewKey(travelId, planPlaceId),
      queryFn: () => getPlanPlaceReview(travelId, planPlaceId),
      enabled: Boolean(travelId && planPlaceId),
    })),
    combine: (results) => ({
      reviews: new Map<string, PlanPlaceReviewResponse | null>(
        planPlaceIds.map((id, index) => [id, results[index]?.data ?? null])
      ),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  });
}

interface SaveReviewVariables {
  request: PlanPlaceReviewRequest;
  /** 이미 후기가 있으면 PATCH, 없으면 POST */
  exists: boolean;
}

export function useSavePlanPlaceReview(travelId: string, planPlaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ request, exists }: SaveReviewVariables) =>
      exists
        ? updatePlanPlaceReview(travelId, planPlaceId, request)
        : createPlanPlaceReview(travelId, planPlaceId, request),
    onSuccess: (review) => {
      queryClient.setQueryData(planPlaceReviewKey(travelId, planPlaceId), review);
    },
  });
}

export function useDeletePlanPlaceReview(travelId: string, planPlaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deletePlanPlaceReview(travelId, planPlaceId),
    onSuccess: () => {
      queryClient.setQueryData(planPlaceReviewKey(travelId, planPlaceId), null);
    },
  });
}
