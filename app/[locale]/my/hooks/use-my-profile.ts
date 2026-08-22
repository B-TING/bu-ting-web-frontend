'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMyProfile,
  getMyTravelRecordBookmarks,
  getMyTravelRecords,
  getMyVisitedPlaceCount,
  updateMyProfile,
  type MyTravelRecord,
  type UpdateMyProfileRequest,
} from '../api/my-profile';

export const myProfileQueryKey = ['my-profile'] as const;
const myTravelRecordsQueryKey = ['my-travel-records'] as const;
const myTravelRecordBookmarksQueryKey = ['my-travel-record-bookmarks'] as const;

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

export function useMyTravelRecords(enabled = true) {
  return useQuery({
    queryKey: myTravelRecordsQueryKey,
    queryFn: getMyTravelRecords,
    enabled,
    retry: false,
  });
}

export function useMyTravelRecordBookmarks(enabled = true) {
  return useQuery({
    queryKey: myTravelRecordBookmarksQueryKey,
    queryFn: getMyTravelRecordBookmarks,
    enabled,
    retry: false,
  });
}

export function useMyVisitedPlaceCount(
  records: MyTravelRecord[] | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ['my-visited-place-count', records?.map((record) => record.travelRecordId)],
    queryFn: () => getMyVisitedPlaceCount(records ?? []),
    enabled: enabled && Boolean(records),
    retry: false,
  });
}
