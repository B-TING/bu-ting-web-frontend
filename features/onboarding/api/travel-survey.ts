import { apiRequest } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';
import type {
  TravelSurveyRequest,
  TravelSurveyResponse,
} from '@/types/onboarding';

export async function getTravelSurvey() {
  try {
    return await apiRequest<TravelSurveyResponse>('/api/v1/travel-surveys');
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return null;
    }

    throw error;
  }
}

export function saveTravelSurvey(request: TravelSurveyRequest) {
  return apiRequest<TravelSurveyResponse>('/api/v1/travel-surveys', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}
