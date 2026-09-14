import { apiRequest } from '@/lib/api-client';
import type { FestivalSearchResponse } from '@/types/festival';

export function getHelpdeskFestivals(today: string): Promise<FestivalSearchResponse> {
  // Include festivals that started earlier and are still running.
  return apiRequest<FestivalSearchResponse>(`/api/v1/places/festivals?eventStartDate=${Number(today.slice(0, 4)) - 1}0101&eventEndDate=${today}&page=1&size=100`);
}

export function getHelpdeskLockers(latitude: number, longitude: number): Promise<unknown> {
  return apiRequest<unknown>(`/api/v1/storage-locations?latitude=${latitude}&longitude=${longitude}&radius=20000`);
}
