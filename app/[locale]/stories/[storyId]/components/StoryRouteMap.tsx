'use client';

import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { StoryPlaceReview } from '@/app/[locale]/stories/story-data';

interface KakaoLatLng {
  new (latitude: number, longitude: number): KakaoLatLngInstance;
}

interface KakaoLatLngInstance {}

interface KakaoMap {
  setBounds: (
    bounds: KakaoLatLngBoundsInstance,
    left?: number,
    top?: number,
    right?: number,
    bottom?: number,
  ) => void;
}

interface KakaoMapConstructor {
  new (
    container: HTMLElement,
    options: { center: KakaoLatLngInstance; level: number },
  ): KakaoMap;
}

interface KakaoCustomOverlayConstructor {
  new (options: {
    position: KakaoLatLngInstance;
    content: HTMLElement;
    yAnchor: number;
    zIndex: number;
  }): {
    setMap: (map: KakaoMap) => void;
  };
}

interface KakaoPolylineConstructor {
  new (options: {
    path: KakaoLatLngInstance[];
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeStyle: 'solid';
  }): {
    setMap: (map: KakaoMap) => void;
  };
}

interface KakaoLatLngBoundsConstructor {
  new (): KakaoLatLngBoundsInstance;
}

interface KakaoLatLngBoundsInstance {
  extend: (latLng: KakaoLatLngInstance) => void;
}

interface KakaoMaps {
  load: (callback: () => void) => void;
  LatLng: KakaoLatLng;
  Map: KakaoMapConstructor;
  CustomOverlay: KakaoCustomOverlayConstructor;
  Polyline: KakaoPolylineConstructor;
  LatLngBounds: KakaoLatLngBoundsConstructor;
}

interface KakaoWindow {
  maps: KakaoMaps;
}

function getKakaoWindow() {
  return (window as Window & { kakao?: KakaoWindow }).kakao;
}

function loadKakaoMapScript() {
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_JS_API_KEY;

  if (!apiKey) {
    return Promise.reject(new Error('Kakao JS API key is missing.'));
  }

  const loadedKakao = getKakaoWindow();

  if (loadedKakao?.maps) {
    return Promise.resolve(loadedKakao);
  }

  return new Promise<KakaoWindow>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-story-map-script="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        const kakao = getKakaoWindow();

        if (kakao) {
          resolve(kakao);
        } else {
          reject(new Error('Failed to load Kakao Map script.'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load Kakao Map script.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;
    script.dataset.kakaoStoryMapScript = 'true';
    script.onload = () => {
      const kakao = getKakaoWindow();

      if (kakao) {
        resolve(kakao);
      } else {
        reject(new Error('Failed to load Kakao Map script.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Kakao Map script.'));
    };
    document.head.appendChild(script);
  });
}

export function StoryRouteMap({ places }: { places: StoryPlaceReview[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function renderMap() {
      if (!mapRef.current || places.length === 0) {
        return;
      }

      try {
        const kakao = await loadKakaoMapScript();

        kakao.maps.load(() => {
          if (!mapRef.current || !isMounted) {
            return;
          }

          const runtimeKakao = getKakaoWindow();

          if (!runtimeKakao) {
            return;
          }

          const firstPlace = places[0];
          const center = new runtimeKakao.maps.LatLng(
            firstPlace.latitude,
            firstPlace.longitude,
          );
          const map = new runtimeKakao.maps.Map(mapRef.current, {
            center,
            level: 7,
          });

          const path = places.map(
            (place) =>
              new runtimeKakao.maps.LatLng(place.latitude, place.longitude),
          );

          const bounds = new runtimeKakao.maps.LatLngBounds();

          path.forEach((position, index) => {
            bounds.extend(position);

            const badge = document.createElement('div');
            Object.assign(badge.style, {
              width: '36px',
              height: '36px',
              borderRadius: '9999px',
              background: '#0284c7',
              border: '3px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 10px 20px rgba(2, 132, 199, 0.25)',
              transform: 'translate(-50%, -50%)',
            });
            badge.textContent = String(index + 1);

            const overlay = new runtimeKakao.maps.CustomOverlay({
              position,
              content: badge,
              yAnchor: 1,
              zIndex: 10,
            });

            overlay.setMap(map);
          });

          if (path.length > 1) {
            const polyline = new runtimeKakao.maps.Polyline({
              path,
              strokeWeight: 4,
              strokeColor: '#0ea5e9',
              strokeOpacity: 0.85,
              strokeStyle: 'solid',
            });

            polyline.setMap(map);
          }

          map.setBounds(bounds, 80, 80, 80, 80);

          if (isMounted) {
            setIsReady(true);
            setMapError(null);
          }
        });
      } catch {
        if (isMounted) {
          setMapError('지도를 불러오지 못했어요.');
          setIsReady(false);
        }
      }
    }

    void renderMap();

    return () => {
      isMounted = false;
    };
  }, [places]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-sm font-semibold text-sky-700">경로 지도</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">
          방문 장소 동선
        </h2>
      </div>

      <div className="relative h-[420px] bg-slate-100">
        <div ref={mapRef} className="h-full w-full" />

        {!isReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500">
            경로 지도를 불러오는 중이에요...
          </div>
        ) : null}

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          총 {places.length}곳 방문
        </div>

        {mapError ? (
          <div className="absolute bottom-4 left-4 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm">
            {mapError}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 border-t border-slate-100 px-6 py-5 md:grid-cols-3">
        {places.map((place) => (
          <div key={place.id} className="rounded-2xl bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <div className="flex size-7 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">
                {place.order}
              </div>
              {place.name}
            </div>
            <p className="mt-2 inline-flex items-start gap-2 text-sm leading-6 text-slate-500">
              <MapPin className="mt-1 size-4 shrink-0 text-slate-400" />
              {place.address}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
