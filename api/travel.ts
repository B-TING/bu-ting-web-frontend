import { apiRequest } from '@/lib/api-client';
import type { TravelCreateRequest, TravelResponse } from '@/types/travel';

export function createTravel(request: TravelCreateRequest) {
  return apiRequest<TravelResponse>('/api/v1/travels', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
