import type { AdminEventPlace, AdminTourPlace, AdminTourPlaceSearch } from '../types/event-admin';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function coordinate(value: unknown, limit: number): number {
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '')
    throw new Error('관광지 좌표 형식을 확인해 주세요.');
  const n = Number(value);
  if (!Number.isFinite(n) || Math.abs(n) > limit)
    throw new Error('관광지 좌표 범위를 확인해 주세요.');
  return n;
}
function identifier(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) return String(value);
  throw new Error('관광지 contentId를 확인해 주세요.');
}
export function parseAdminPlaceSearch(value: unknown): AdminTourPlaceSearch {
  const data = record(value) && 'data' in value ? value.data : value;
  if (
    !record(data) ||
    !Array.isArray(data.places) ||
    !Number.isInteger(data.totalCount) ||
    Number(data.totalCount) < 0 ||
    !Number.isInteger(data.page) ||
    !Number.isInteger(data.size) ||
    Number(data.size) < 1
  )
    throw new Error('관광지 검색 응답 형식이 예상과 다릅니다.');
  return {
    totalCount: Number(data.totalCount),
    page: Number(data.page),
    size: Number(data.size),
    places: data.places.map((p: unknown) => {
      if (!record(p) || typeof p.title !== 'string' || !p.title.trim())
        throw new Error('관광지 이름을 확인해 주세요.');
      return {
        contentId: identifier(p.contentId),
        contentTypeId: identifier(p.contentTypeId),
        title: p.title,
        address: typeof p.address === 'string' ? p.address : '',
        latitude: coordinate(p.latitude, 90),
        longitude: coordinate(p.longitude, 180),
      };
    }),
  };
}
export function targetFromTourPlace(
  target: AdminEventPlace,
  place: AdminTourPlace
): AdminEventPlace {
  return {
    ...target,
    placeContentId: place.contentId,
    contentTypeId: place.contentTypeId,
    name: place.title,
    sourceLatitude: place.latitude,
    sourceLongitude: place.longitude,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}
export function targetCoordinatesChanged(target: AdminEventPlace) {
  return (
    target.sourceLatitude !== null &&
    target.sourceLongitude !== null &&
    (target.latitude !== target.sourceLatitude || target.longitude !== target.sourceLongitude)
  );
}
