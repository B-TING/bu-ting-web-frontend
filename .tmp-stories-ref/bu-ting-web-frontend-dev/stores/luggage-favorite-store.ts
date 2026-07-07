'use client';

import { create } from 'zustand';

const FAVORITE_LUGGAGE_STATIONS_KEY = 'buting-favorite-luggage-stations';

interface LuggageFavoriteState {
  favoriteStationIds: Set<string>;
  hasHydrated: boolean;
  hydrate: () => void;
  isFavorite: (stationId: string) => boolean;
  toggleFavorite: (stationId: string) => void;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function readFavoriteStationIds(): Set<string> {
  if (!isBrowser()) return new Set();

  try {
    const raw = window.localStorage.getItem(FAVORITE_LUGGAGE_STATIONS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeFavoriteStationIds(ids: Set<string>) {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    FAVORITE_LUGGAGE_STATIONS_KEY,
    JSON.stringify([...ids]),
  );
}

export const useLuggageFavoriteStore = create<LuggageFavoriteState>(
  (set, get) => ({
    favoriteStationIds: new Set(),
    hasHydrated: false,
    hydrate: () => {
      if (get().hasHydrated) return;

      set({
        favoriteStationIds: readFavoriteStationIds(),
        hasHydrated: true,
      });
    },
    isFavorite: (stationId) => get().favoriteStationIds.has(stationId),
    toggleFavorite: (stationId) => {
      const next = new Set(get().favoriteStationIds);
      next.has(stationId) ? next.delete(stationId) : next.add(stationId);
      writeFavoriteStationIds(next);
      set({ favoriteStationIds: next });
    },
  }),
);
