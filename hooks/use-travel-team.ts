'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTravelInvite,
  deleteTravelInvite,
  getTravelInvite,
  getTravelMembers,
} from '@/api/travel-team';

export function useTravelMembers(travelId: string) {
  return useQuery({
    queryKey: ['travel-members', travelId],
    queryFn: () => getTravelMembers(travelId),
    enabled: Boolean(travelId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

export function useTravelInvite(travelId: string, isLeader: boolean) {
  return useQuery({
    queryKey: ['travel-invite', travelId],
    queryFn: () => getTravelInvite(travelId),
    enabled: Boolean(travelId) && isLeader,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

export function useCreateTravelInvite(travelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createTravelInvite(travelId),
    onSuccess: (invite) => {
      queryClient.setQueryData(['travel-invite', travelId], { ...invite, expiredAt: '' });
    },
  });
}

export function useDeleteTravelInvite(travelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteTravelInvite(travelId),
    onSuccess: () => queryClient.setQueryData(['travel-invite', travelId], null),
  });
}
