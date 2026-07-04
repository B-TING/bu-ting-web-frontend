'use client';

import { useEffect, useRef, useState } from 'react';

import Header from '@/components/Header';
import {
  createCircleMarkerElement,
  createKakaoMap,
  createMarkerOverlay,
  fitBoundsToPositions,
  loadKakaoMapsSdk,
  panTo,
  type KakaoCustomOverlay,
  type KakaoMap,
} from '@/lib/kakao-map';
import { MOCK_LUGGAGE_STATIONS } from '@/constants/luggage-stations';
import type { LuggageStation } from '@/types/luggage';
import { LuggageStationCard } from './components/LuggageStationCard';
import { LuggageStationDetailPanel } from './components/LuggageStationDetailPanel';

const BUSAN_CENTER = { lat: 35.1587, lng: 129.0756 };

export default function LuggagePage() {
  const stations = MOCK_LUGGAGE_STATIONS;
  const [selectedStation, setSelectedStation] = useState<LuggageStation | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);

  // ── Kakao Maps SDK 로드 ──
  useEffect(() => {
    let cancelled = false;

    loadKakaoMapsSdk().then(() => {
      if (cancelled || !mapRef.current) return;
      mapInstanceRef.current = createKakaoMap(mapRef.current, {
        center: BUSAN_CENTER,
        level: 8,
      });
      setMapReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── 마커 렌더링 ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    stations.forEach((station) => {
      const isSelected = selectedStation?.id === station.id;
      const el = createCircleMarkerElement({
        content: '🧳',
        selected: isSelected,
      });
      el.style.fontSize = isSelected ? '18px' : '14px';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedStation(station);
      });

      const overlay = createMarkerOverlay(
        map,
        { lat: station.lat, lng: station.lng },
        el,
        isSelected ? 20 : 10
      );
      overlaysRef.current.push(overlay);
    });

    if (selectedStation) {
      panTo(map, {
        lat: selectedStation.lat,
        lng: selectedStation.lng,
      });
    } else {
      fitBoundsToPositions(
        map,
        stations.map((station) => ({ lat: station.lat, lng: station.lng }))
      );
    }
  }, [mapReady, stations, selectedStation]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Header title="짐 보관소" />

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-[380px] shrink-0 flex-col overflow-hidden border-r border-gray-100 bg-white">
          {selectedStation ? (
            <LuggageStationDetailPanel
              station={selectedStation}
              onBack={() => setSelectedStation(null)}
            />
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {stations.map((station) => (
                <LuggageStationCard
                  key={station.id}
                  station={station}
                  onClick={() => setSelectedStation(station)}
                />
              ))}
            </div>
          )}
        </aside>

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={mapRef}
            className="absolute inset-0"
          />

          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="mx-auto mb-2 size-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="text-sm text-gray-400">지도를 불러오는 중...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
