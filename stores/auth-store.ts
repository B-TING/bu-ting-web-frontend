'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import type { OAuthLoginData } from '@/types/auth';

const AUTH_STORAGE_KEY = 'buting-auth';
const AUTH_PREFERENCE_KEY = 'buting-auth-auto-login';

type AuthPersistMode = 'local' | 'session';

function getPersistMode(): AuthPersistMode {
  if (typeof window === 'undefined') {
    return 'session';
  }

  return localStorage.getItem(AUTH_PREFERENCE_KEY) === 'true'
    ? 'local'
    : 'session';
}

export function getSavedAutoLoginPreference() {
  return getPersistMode() === 'local';
}

export function saveAutoLoginPreference(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_PREFERENCE_KEY, String(enabled));
}

function getStorageWithSession() {
  if (typeof window === 'undefined') {
    return sessionStorage;
  }

  const localValue = localStorage.getItem(AUTH_STORAGE_KEY);
  if (localValue) {
    return localStorage;
  }

  const sessionValue = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (sessionValue) {
    return sessionStorage;
  }

  return getPersistMode() === 'local' ? localStorage : sessionStorage;
}

function getPrimaryStorageForWrite() {
  return getPersistMode() === 'local' ? localStorage : sessionStorage;
}

function getSecondaryStorageForWrite() {
  return getPersistMode() === 'local' ? sessionStorage : localStorage;
}

const authPersistStorage: StateStorage = {
  getItem(name) {
    if (typeof window === 'undefined') {
      return null;
    }

    return getStorageWithSession().getItem(name);
  },

  setItem(name, value) {
    if (typeof window === 'undefined') {
      return;
    }

    getPrimaryStorageForWrite().setItem(name, value);
    getSecondaryStorageForWrite().removeItem(name);
  },

  removeItem(name) {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

interface AuthState {
  user: Omit<OAuthLoginData, 'accessToken' | 'tokenType' | 'expiresIn'> | null;
  accessToken: string | null;
  tokenType: string;
  expiresAt: number | null;
  autoLoginEnabled: boolean;
  setSession: (session: OAuthLoginData) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      tokenType: 'Bearer',
      expiresAt: null,
      autoLoginEnabled: getSavedAutoLoginPreference(),
      setSession: ({ accessToken, tokenType, expiresIn, ...user }) =>
        set({
          user,
          accessToken,
          tokenType,
          expiresAt: Date.now() + expiresIn * 1000,
          autoLoginEnabled: getSavedAutoLoginPreference(),
        }),
      clearSession: () => {
        authPersistStorage.removeItem(AUTH_STORAGE_KEY);
        set({
          user: null,
          accessToken: null,
          tokenType: 'Bearer',
          expiresAt: null,
          autoLoginEnabled: getSavedAutoLoginPreference(),
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => authPersistStorage),
    },
  ),
);

export function getAuthorizationHeader() {
  const { accessToken, tokenType, expiresAt, clearSession } =
    useAuthStore.getState();

  if (!accessToken) {
    return null;
  }

  if (!expiresAt || Date.now() >= expiresAt) {
    clearSession();
    return null;
  }

  return `${tokenType || 'Bearer'} ${accessToken}`;
}
