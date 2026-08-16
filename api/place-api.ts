import { apiRequest } from '@/lib/api-client';
import {
  PlaceDetailRequest,
  PlaceDetailResponse,
  PlaceListRequest,
  PlaceListResponse,
  PlaceSearchRequest,
} from '@/types/place';

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

  return apiRequest<PlaceListResponse>(`/api/v1/places/location?${params.toString()}`);
}

export function getPlaceDetail({ contentId, contentTypeId, googleSearchText }: PlaceDetailRequest) {
  const params = new URLSearchParams({ contentTypeId });

  if (googleSearchText) params.set('googleSearchText', googleSearchText);

  return apiRequest<PlaceDetailResponse>(`/api/v1/places/${contentId}/detail?${params.toString()}`);
}

export function searchPlaces({ keyword, page = 1, size = 10 }: PlaceSearchRequest) {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });
  return apiRequest<PlaceListResponse>(`/api/v1/places/search?${params.toString()}`);
}
