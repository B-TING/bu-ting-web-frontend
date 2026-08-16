'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  bookmarkTravelRecord,
  createTravelRecordComment,
  deleteTravelRecordComment,
  getMyTravelRecordBookmarks,
  getTravelRecordComments,
  getTravelRecordDetail,
  getTravelRecordFeed,
  likeTravelRecord,
  unbookmarkTravelRecord,
  unlikeTravelRecord,
  updateTravelRecordComment,
} from '../api/travel-records';

export const travelRecordKeys = {
  feed: ['travel-records', 'feed'] as const,
  detail: (id: string) => ['travel-records', 'detail', id] as const,
  comments: (id: string) => ['travel-records', 'comments', id] as const,
  bookmarks: ['travel-records', 'bookmarks'] as const,
};

export function useTravelRecordFeed() {
  return useInfiniteQuery({
    queryKey: travelRecordKeys.feed,
    queryFn: ({ pageParam }) => getTravelRecordFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function useTravelRecordDetail(id: string) {
  return useQuery({
    queryKey: travelRecordKeys.detail(id),
    queryFn: () => getTravelRecordDetail(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useTravelRecordComments(id: string, enabled = true) {
  return useQuery({
    queryKey: travelRecordKeys.comments(id),
    queryFn: () => getTravelRecordComments(id),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useTravelRecordInteractionMutations(id: string) {
  const queryClient = useQueryClient();
  const refreshFeed = () => {
    void queryClient.invalidateQueries({ queryKey: travelRecordKeys.feed });
  };

  const updateDetailLikeCount = (likeCount: number) => {
    queryClient.setQueryData(
      travelRecordKeys.detail(id),
      (detail: Awaited<ReturnType<typeof getTravelRecordDetail>> | undefined) =>
        detail ? { ...detail, likeCount: Math.max(0, likeCount) } : detail,
    );
  };

  return {
    like: useMutation({
      mutationFn: () => likeTravelRecord(id),
      onSuccess: (result) => {
        updateDetailLikeCount(result.likeCount);
        refreshFeed();
      },
    }),
    unlike: useMutation({
      mutationFn: () => unlikeTravelRecord(id),
      onSuccess: () => {
        const detail = queryClient.getQueryData<
          Awaited<ReturnType<typeof getTravelRecordDetail>>
        >(travelRecordKeys.detail(id));
        if (detail) updateDetailLikeCount(detail.likeCount - 1);
        refreshFeed();
      },
    }),
    bookmark: useMutation({
      mutationFn: () => bookmarkTravelRecord(id),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: travelRecordKeys.bookmarks });
      },
    }),
    unbookmark: useMutation({
      mutationFn: () => unbookmarkTravelRecord(id),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: travelRecordKeys.bookmarks });
      },
    }),
  };
}

export function useMyTravelRecordBookmarks(enabled: boolean) {
  return useQuery({
    queryKey: travelRecordKeys.bookmarks,
    queryFn: getMyTravelRecordBookmarks,
    enabled,
    retry: false,
  });
}

export function useTravelRecordCommentMutations(id: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: travelRecordKeys.comments(id) });

  return {
    create: useMutation({
      mutationFn: (content: string) => createTravelRecordComment(id, content),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
        updateTravelRecordComment(id, commentId, content),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (commentId: string) => deleteTravelRecordComment(id, commentId),
      onSuccess: refresh,
    }),
  };
}
