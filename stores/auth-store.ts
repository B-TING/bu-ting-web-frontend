'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { OAuthLoginData } from '@/types/auth';

interface AuthState {
  user: Omit<OAuthLoginData, 'accessToken' | 'tokenType' | 'expiresIn'> | null;
  accessToken: string | null;
  tokenType: string;
  expiresAt: number | null;
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
      setSession: ({ accessToken, tokenType, expiresIn, ...user }) =>
        set({
          user,
          accessToken,
          tokenType,
          expiresAt: Date.now() + expiresIn * 1000,
        }),
      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          tokenType: 'Bearer',
          expiresAt: null,
        }),
    }),
    {
      name: 'buting-auth',
      storage: createJSONStorage(() => sessionStorage),
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
