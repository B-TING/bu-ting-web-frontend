'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { FestivalResolvedView } from '@/types/festival';

declare global {
  interface Window {
    kakao: any;
  }
}

const DEFAULT_CENTER = {
  latitude: 35.1796,
  longitude: 129.0756,
};

function loadKakaoMapScript() {
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_JS_API_KEY;

  if (!apiKey) {
    return Promise.reject(new Error('Kakao JS API key is missing.'));
  }

  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao);
  }

  return new Promise<typeof window.kakao>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-map-script="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.kakao));
      existingScript.addEventListener('error', () =>
        reject(new Error('Failed to load Kakao Map script.')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
    script.async = true;
    script.dataset.kakaoMapScript = 'true';

    script.onload = () => resolve(window.kakao);
    script.onerror = () => reject(new Error('Failed to load Kakao Map script.'));

    document.head.appendChild(script);
  });
}

function createMap(container: HTMLDivElement, latitude: number, longitude: number) {
  if (!window.kakao?.maps) {
    return;
  }

  window.kakao.maps.load(() => {
    const position = new window.kakao.maps.LatLng(latitude, longitude);
    const map = new window.kakao.maps.Map(container, {
      center: position,
      level: 4,
    });

    new window.kakao.maps.Marker({
      map,
      position,
    });
  });
}

export function FestivalLocationMap({
  festival,
}: {
  festival: FestivalResolvedView;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapAddress = festival.resolvedAddress;

  const coordinates = useMemo(
    () => ({
      latitude: festival.resolvedLatitude,
      longitude: festival.resolvedLongitude,
    }),
    [festival.resolvedLatitude, festival.resolvedLongitude],
  );

  useEffect(() => {
    let isMounted = true;

    async function renderMap() {
      if (!mapRef.current) {
        return;
      }

      try {
        await loadKakaoMapScript();

        const latitude = coordinates.latitude;
        const longitude = coordinates.longitude;

        if (latitude != null && longitude != null) {
          createMap(mapRef.current, latitude, longitude);

          if (isMounted) {
            setIsMapReady(true);
            setMapError(null);
          }
          return;
        }

        if (mapAddress && window.kakao?.maps?.services) {
          window.kakao.maps.load(() => {
            const geocoder = new window.kakao.maps.services.Geocoder();

            geocoder.addressSearch(
              mapAddress,
              (result: Array<{ x: string; y: string }>, status: string) => {
                if (!isMounted || !mapRef.current) {
                  return;
                }

                if (
                  status === window.kakao.maps.services.Status.OK &&
                  result.length > 0
                ) {
                  createMap(
                    mapRef.current,
                    Number(result[0].y),
                    Number(result[0].x),
                  );
                  setIsMapReady(true);
                  setMapError(null);
                  return;
                }

                createMap(
                  mapRef.current,
                  DEFAULT_CENTER.latitude,
                  DEFAULT_CENTER.longitude,
                );
                setIsMapReady(true);
                setMapError('주소로 위치를 찾지 못해 기본 위치로 표시 중이에요.');
              },
            );
          });

          return;
        }

        createMap(mapRef.current, DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude);

        if (isMounted) {
          setIsMapReady(true);
          setMapError('좌표나 주소 정보가 없어 기본 위치로 표시 중이에요.');
        }
      } catch {
        if (isMounted) {
          setMapError('카카오맵을 불러오지 못했어요.');
          setIsMapReady(false);
        }
      }
    }

    void renderMap();

    return () => {
      isMounted = false;
    };
  }, [coordinates.latitude, coordinates.longitude, mapAddress]);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-sm font-semibold text-sky-700">행사 위치</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">행사 위치 정보</h2>
      </div>

      <div className="relative h-[720px] bg-slate-100">
        <div ref={mapRef} className="h-full w-full" />

        {!isMapReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500">
            카카오맵 불러오는 중...
          </div>
        ) : null}

        <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
          {mapError
            ? mapError
            : coordinates.latitude != null && coordinates.longitude != null
              ? `위도 ${coordinates.latitude}, 경도 ${coordinates.longitude}`
              : mapAddress ?? '행사 위치 정보 없음'}
        </div>
      </div>
    </section>
  );
}
