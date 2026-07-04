import { apiRequest } from '@/lib/api-client';
import { ApiResponse } from '@/types/auth';
import { PlaceListRequest, PlaceListResponse } from '@/types/place';

export function getPlaceList(request: PlaceListRequest) {
  const params = new URLSearchParams({
    mapX: String(request.mapX),
    mapY: String(request.mapY),
    radius: String(request.radius),
  });

  if (request.page !== undefined) params.set('page', String(request.page));
  if (request.size !== undefined) params.set('size', String(request.size));
  if (request.contentTypeId) params.set('contentTypeId', request.contentTypeId);
  if (request.arrange) params.set('arrange', request.arrange);

  return apiRequest<ApiResponse<PlaceListResponse>>(
    `/api/v1/places/location?${params.toString()}`,
  );
}
