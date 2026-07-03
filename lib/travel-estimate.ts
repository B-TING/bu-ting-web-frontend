import type { TransitMode } from '@/types/itinerary';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TravelEstimate {
  mode: TransitMode;
  minutes: number;
  km: number;
}

const EARTH_RADIUS_KM = 6371;

// 실제 길찾기 API(Kakao Mobility 등) 연동 전까지 쓰는 이동수단별 평균 속도(km/h) 근사치
const MODE_SPEED_KMH: Record<TransitMode, number> = {
  walk: 4,
  public: 20,
  car: 30,
};

// 직선거리와 달리 실제 도로/보행로는 우회하므로 곱해주는 보정 계수
const ROUTE_DETOUR_FACTOR = 1.3;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function estimateTravel(from: Coordinates, to: Coordinates, mode: TransitMode): TravelEstimate {
  const straightKm = haversineDistanceKm(from, to);
  const km = Math.round(straightKm * ROUTE_DETOUR_FACTOR * 10) / 10;
  const minutes = Math.max(1, Math.round((km / MODE_SPEED_KMH[mode]) * 60));
  return { mode, minutes, km };
}

const ALL_MODES: TransitMode[] = ['walk', 'public', 'car'];

export function estimateTravelAllModes(from: Coordinates, to: Coordinates): TravelEstimate[] {
  return ALL_MODES.map((mode) => estimateTravel(from, to, mode));
}
