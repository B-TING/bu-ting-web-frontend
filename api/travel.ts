import { apiRequest } from '@/lib/api-client';
import type {
  AiPlanCreateRequest,
  PlanCreateRequest,
  PlanPlaceResponse,
  PlanPlaceCreateRequest,
  PlanResponse,
  TravelCreateRequest,
  TravelPlansResponse,
  TravelResponse,
} from '@/types/travel';

export function createTravel(request: TravelCreateRequest) {
  return apiRequest<TravelResponse>('/api/v1/travels', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function getTravelPlans(travelId: string) {
  return apiRequest<TravelPlansResponse>(`/api/v1/travels/${travelId}/plans`);
}

export function createAiPlan(travelId: string, request: AiPlanCreateRequest) {
  return apiRequest<TravelPlansResponse>(`/api/v1/travels/${travelId}/ai-plans`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function createTravelPlan(travelId: string, request: PlanCreateRequest) {
  return apiRequest<PlanResponse>(`/api/v1/travels/${travelId}/plans`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updatePlanPlaceVisited(planPlaceId: string, visited: boolean) {
  return apiRequest<PlanPlaceResponse>(`/api/v1/plans/places/${planPlaceId}/visited`, {
    method: 'PATCH',
    body: JSON.stringify({ visited }),
  });
}

export function createPlanPlace(planId: string, request: PlanPlaceCreateRequest) {
  return apiRequest<PlanPlaceResponse>(`/api/v1/plans/${planId}/places`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
