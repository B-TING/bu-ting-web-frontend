'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMyProfile,
  updateMyProfile,
  type UpdateMyProfileRequest,
} from '../api/my-profile';

export const myProfileQueryKey = ['my-profile'] as const;

export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: myProfileQueryKey,
    queryFn: getMyProfile,
    enabled,
    retry: false,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateMyProfileRequest) => updateMyProfile(request),
    onSuccess: (profile) => {
      queryClient.setQueryData(myProfileQueryKey, profile);
    },
  });
}
