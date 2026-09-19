'use client';

import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export function useOperatorAccess() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.userId);

  return useQuery({
    queryKey: ['operator-access', userId],
    queryFn: async ({ signal }) => {
      await apiRequest<unknown>('/api/v1/admin/me', { signal });
      return true;
    },
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
