'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { eventAdminRequest } from '@/api/event-admin';
import type { AdminRecord } from '@/types/event-admin-api';
import { adminRows } from '@/lib/event-admin-api';

export function useAdminPage(path: string) {
  const token = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.userId);
  return useQuery({
    queryKey: ['event-admin-server', userId, path],
    queryFn: ({ signal }) => eventAdminRequest(path, { signal }),
    select: adminRows,
    enabled: Boolean(token),
    retry: false,
    staleTime: 0,
  });
}

export function useAdminRead(path: string | null) {
  const token = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.userId);
  return useQuery({
    queryKey: ['event-admin-server', userId, path],
    queryFn: ({ signal }) => eventAdminRequest(path!, { signal }),
    enabled: Boolean(path && token),
    retry: false,
    staleTime: 0,
  });
}
export function useAdminWrite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { path: string; method: string; body?: AdminRecord; key: string }) =>
      eventAdminRequest(input.path, input),
    retry: false,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['event-admin-server'] });
    },
  });
}
