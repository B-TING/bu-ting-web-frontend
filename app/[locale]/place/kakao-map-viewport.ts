import type { KakaoLatLngLiteral, KakaoMap } from '@/lib/kakao-map';

interface KakaoMapsEventNamespace {
  event: {
    addListener(target: unknown, type: string, handler: () => void): void;
    removeListener(target: unknown, type: string, handler: () => void): void;
  };
}

interface KakaoLatLngLike {
  getLat(): number;
  getLng(): number;
}

interface KakaoMapWithViewport extends KakaoMap {
  getCenter(): KakaoLatLngLike;
  getBounds(): {
    getSouthWest(): KakaoLatLngLike;
    getNorthEast(): KakaoLatLngLike;
  };
  panBy(dx: number, dy: number): void;
}

// 마커(CustomOverlay) 위에서 시작한 드래그는 카카오맵이 지도 자체의
// 드래그로 인식하지 않아 지도가 움직이지 않는다. 마커 위 드래그를
// 감지해 픽셀 델타만큼 수동으로 지도를 이동시켜 보완한다.
export function panMapByPixels(map: KakaoMap, dx: number, dy: number) {
  (map as KakaoMapWithViewport).panBy(dx, dy);
}

function getKakaoMapsEvent() {
  return (window as unknown as { kakao: { maps: KakaoMapsEventNamespace } })
    .kakao.maps.event;
}

export function onMapIdle(map: KakaoMap, handler: () => void) {
  const kakaoEvent = getKakaoMapsEvent();
  kakaoEvent.addListener(map, 'idle', handler);
  return () => kakaoEvent.removeListener(map, 'idle', handler);
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

const EARTH_RADIUS_METERS = 6371000;

function distanceInMeters(a: KakaoLatLngLiteral, b: KakaoLatLngLiteral) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinLng * sinLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function getMapViewport(map: KakaoMap): {
  center: KakaoLatLngLiteral;
  radius: number;
} {
  const viewportMap = map as KakaoMapWithViewport;
  const center = viewportMap.getCenter();
  const northEast = viewportMap.getBounds().getNorthEast();
  const centerLiteral = { lat: center.getLat(), lng: center.getLng() };

  return {
    center: centerLiteral,
    radius: distanceInMeters(centerLiteral, {
      lat: northEast.getLat(),
      lng: northEast.getLng(),
    }),
  };
}
