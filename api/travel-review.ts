import { ApiError, apiRequest } from '@/lib/api-client';
import type { PlanPlaceReviewRequest, PlanPlaceReviewResponse } from '@/types/review';

function reviewPath(travelId: string, planPlaceId: string) {
  return `/api/v1/travels/${travelId}/plans/places/${planPlaceId}/review`;
}

/** 후기가 없으면 null을 반환한다. (미작성 상태를 정상 흐름으로 취급) */
export async function getPlanPlaceReview(
  travelId: string,
  planPlaceId: string
): Promise<PlanPlaceReviewResponse | null> {
  try {
    return await apiRequest<PlanPlaceReviewResponse>(reviewPath(travelId, planPlaceId));
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export function createPlanPlaceReview(
  travelId: string,
  planPlaceId: string,
  request: PlanPlaceReviewRequest
) {
  return apiRequest<PlanPlaceReviewResponse>(reviewPath(travelId, planPlaceId), {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updatePlanPlaceReview(
  travelId: string,
  planPlaceId: string,
  request: PlanPlaceReviewRequest
) {
  return apiRequest<PlanPlaceReviewResponse>(reviewPath(travelId, planPlaceId), {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export function deletePlanPlaceReview(travelId: string, planPlaceId: string) {
  return apiRequest<unknown>(reviewPath(travelId, planPlaceId), { method: 'DELETE' });
}
