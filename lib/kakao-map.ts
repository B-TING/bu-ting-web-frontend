export interface KakaoLatLngLiteral {
  lat: number;
  lng: number;
}

export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void;
}

export interface KakaoMap {
  setBounds(
    bounds: KakaoLatLngBounds,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number,
  ): void;
  panTo(latlng: KakaoLatLng): void;
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
}

interface KakaoMapsNamespace {
  load(callback: () => void): void;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    content: HTMLElement;
    zIndex?: number;
  }) => KakaoCustomOverlay;
}

// `window.kakao`는 itinerary 페이지에서 이미 `any`로 전역 선언돼 있어(app/[locale]/trips/[tripId]/itinerary/page.tsx),
// 여기서 같은 전역을 다른 타입으로 재선언하면 충돌한다. 대신 접근 시점에 타입을 좁혀서 사용한다.
function getKakaoMaps(): KakaoMapsNamespace {
  return (window as unknown as { kakao: { maps: KakaoMapsNamespace } }).kakao.maps;
}

let kakaoMapsSdkPromise: Promise<void> | null = null;

export function loadKakaoMapsSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('카카오맵 SDK는 브라우저 환경에서만 로드할 수 있습니다.'));
  }

  if ((window as unknown as { kakao?: { maps?: unknown } }).kakao?.maps) {
    return Promise.resolve();
  }

  if (kakaoMapsSdkPromise) {
    return kakaoMapsSdkPromise;
  }

  kakaoMapsSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_API_KEY}&autoload=false`;
    script.onload = () => {
      getKakaoMaps().load(() => resolve());
    };
    script.onerror = () => {
      kakaoMapsSdkPromise = null;
      reject(new Error('카카오맵 SDK 로드에 실패했습니다.'));
    };
    document.head.appendChild(script);
  });

  return kakaoMapsSdkPromise;
}

export function createKakaoMap(
  container: HTMLElement,
  options: { center: KakaoLatLngLiteral; level?: number },
) {
  const kakaoMaps = getKakaoMaps();
  return new kakaoMaps.Map(container, {
    center: new kakaoMaps.LatLng(options.center.lat, options.center.lng),
    level: options.level ?? 8,
  });
}

export function createMarkerOverlay(
  map: KakaoMap,
  position: KakaoLatLngLiteral,
  content: HTMLElement,
  zIndex = 10,
) {
  const kakaoMaps = getKakaoMaps();
  const overlay = new kakaoMaps.CustomOverlay({
    position: new kakaoMaps.LatLng(position.lat, position.lng),
    content,
    zIndex,
  });
  overlay.setMap(map);
  return overlay;
}

export function fitBoundsToPositions(
  map: KakaoMap,
  positions: KakaoLatLngLiteral[],
  padding = 80,
) {
  if (positions.length === 0) return;

  const kakaoMaps = getKakaoMaps();
  const bounds = new kakaoMaps.LatLngBounds();
  positions.forEach((p) => bounds.extend(new kakaoMaps.LatLng(p.lat, p.lng)));
  map.setBounds(bounds, padding, padding, padding, padding);
}

export function panTo(map: KakaoMap, position: KakaoLatLngLiteral) {
  const kakaoMaps = getKakaoMaps();
  map.panTo(new kakaoMaps.LatLng(position.lat, position.lng));
}

export function createCircleMarkerElement(options: {
  content: string;
  selected?: boolean;
  size?: number;
}) {
  const { content, selected = false, size = selected ? 38 : 30 } = options;

  const el = document.createElement('div');
  Object.assign(el.style, {
    width: `${size}px`,
    height: `${size}px`,
    background: selected ? '#1d4ed8' : '#3b82f6',
    borderRadius: '50%',
    border: selected ? '3px solid #93c5fd' : '2px solid white',
    boxShadow: selected ? '0 4px 14px rgba(59,130,246,0.55)' : '0 2px 6px rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.2s',
    userSelect: 'none',
    zIndex: selected ? '20' : '10',
  });
  el.textContent = content;

  return el;
}
