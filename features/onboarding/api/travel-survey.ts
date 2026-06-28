import { apiRequest } from '@/lib/api-client';
import type { ApiResponse } from '@/types/auth';
import type {
  TravelSurveyRequest,
  TravelSurveyResponse,
} from '@/types/onboarding';

export function getTravelSurvey() {
  return apiRequest<ApiResponse<TravelSurveyResponse>>(
    '/api/v1/travel-surveys',
  );
}

export function saveTravelSurvey(request: TravelSurveyRequest) {
  return apiRequest<ApiResponse<TravelSurveyResponse>>(
    '/api/v1/travel-surveys',
    {
      method: 'PUT',
      body: JSON.stringify(request),
    },
  );
}
