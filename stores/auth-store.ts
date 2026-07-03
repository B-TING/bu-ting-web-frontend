'use client';

import { create } from 'zustand';

import type { OAuthLoginData } from '@/types/auth';

type AuthUser = Omit<OAuthLoginData, 'accessToken' | 'tokenType' | 'expiresIn'>;

interface StoredSession {
  user: AuthUser | null;
  accessToken: string | null;
  tokenType: string;
  expiresAt: number | null;
}

interface AuthState extends StoredSession {
  autoLoginEnabled: boolean;
  hideUserId: boolean;
  hasHydrated: boolean;
  hydrate: () => void;
  setSession: (session: OAuthLoginData) => void;
  clearSession: () => void;
  setAutoLoginEnabled: (enabled: boolean) => void;
  setHideUserId: (hidden: boolean) => void;
}

const AUTH_LOCAL_STORAGE_KEY = 'buting-auth-local';
const AUTH_SESSION_STORAGE_KEY = 'buting-auth-session';
const AUTO_LOGIN_PREFERENCE_KEY = 'buting-auto-login';
const HIDE_USER_ID_PREFERENCE_KEY = 'buting-hide-user-id';

const EMPTY_SESSION: StoredSession = {
  user: null,
  accessToken: null,
  tokenType: 'Bearer',
  expiresAt: null,
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function readBooleanPreference(key: string, fallback = false) {
  if (!isBrowser()) return fallback;

  const value = window.localStorage.getItem(key);
  if (value === null) return fallback;

  return value === 'true';
}

function writeBooleanPreference(key: string, value: boolean) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, String(value));
}

function parseStoredSession(raw: string | null): StoredSession | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredSession;
    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      tokenType: parsed.tokenType || 'Bearer',
      expiresAt: parsed.expiresAt ?? null,
    };
  } catch {
    return null;
  }
}

function readStoredSession() {
  if (!isBrowser()) return EMPTY_SESSION;

  return (
    parseStoredSession(window.localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)) ??
    parseStoredSession(window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)) ??
    EMPTY_SESSION
  );
}

function writeStoredSession(session: StoredSession, autoLoginEnabled: boolean) {
  if (!isBrowser()) return;

  const serialized = JSON.stringify(session);

  if (autoLoginEnabled) {
    window.localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, serialized);
    window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, serialized);
  window.localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
}

function clearStoredSession() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function getSavedAutoLoginPreference() {
  return readBooleanPreference(AUTO_LOGIN_PREFERENCE_KEY, false);
}

export function saveAutoLoginPreference(enabled: boolean) {
  writeBooleanPreference(AUTO_LOGIN_PREFERENCE_KEY, enabled);
}

function getSavedHideUserIdPreference() {
  return readBooleanPreference(HIDE_USER_ID_PREFERENCE_KEY, false);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...EMPTY_SESSION,
  autoLoginEnabled: false,
  hideUserId: false,
  hasHydrated: false,
  hydrate: () => {
    if (get().hasHydrated) return;

    set({
      ...readStoredSession(),
      autoLoginEnabled: getSavedAutoLoginPreference(),
      hideUserId: getSavedHideUserIdPreference(),
      hasHydrated: true,
    });
  },
  setSession: ({ accessToken, tokenType, expiresIn, ...user }) => {
    const autoLoginEnabled = getSavedAutoLoginPreference();
    const nextSession: StoredSession = {
      user,
      accessToken,
      tokenType,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    writeStoredSession(nextSession, autoLoginEnabled);

    set({
      ...nextSession,
      autoLoginEnabled,
    });
  },
  clearSession: () => {
    clearStoredSession();
    set((state) => ({
      ...EMPTY_SESSION,
      autoLoginEnabled: state.autoLoginEnabled,
      hideUserId: state.hideUserId,
    }));
  },
  setAutoLoginEnabled: (enabled) => {
    saveAutoLoginPreference(enabled);

    const { user, accessToken, tokenType, expiresAt } = get();

    if (accessToken) {
      writeStoredSession(
        {
          user,
          accessToken,
          tokenType,
          expiresAt,
        },
        enabled,
      );
    }

    set({ autoLoginEnabled: enabled });
  },
  setHideUserId: (hidden) => {
    writeBooleanPreference(HIDE_USER_ID_PREFERENCE_KEY, hidden);
    set({ hideUserId: hidden });
  },
}));

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
