'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/stores/auth-store';

export function AuthHydrator() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return null;
}
