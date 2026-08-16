import { ApiError, apiRequest } from '@/lib/api-client';
import { getAuthorizationHeader, useAuthStore } from '@/stores/auth-store';

export interface TravelRecordFeedItem {
  travelRecordId: string;
  travelId: string | null;
  authorId: string;
  authorNickname: string;
  title: string | null;
  content: string | null;
  coverImageUrl: string | null;
  overallRating: number | null;
  travelStartDate: string | null;
  travelEndDate: string | null;
  publishedAt: string | null;
  likeCount: number;
  viewCount: number;
  likedByMe: boolean;
}

export interface TravelRecordFeedPage {
  items: TravelRecordFeedItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface TravelRecordPlace {
  travelRecordPlaceId: string;
  sequence: number | null;
  placeName: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  provider: string | null;
  durationMinutes: number | null;
  memo: string | null;
}

export interface TravelRecordDetail {
  travelRecordId: string;
  travelId: string | null;
  authorId: string;
  title: string | null;
  content: string | null;
  coverImageUrl: string | null;
  overallRating: number | null;
  travelStartDate: string | null;
  travelEndDate: string | null;
  publishedAt: string | null;
  likeCount: number;
  viewCount: number;
  days: Array<{
    travelRecordDayId: string;
    dayNumber: number;
    visitDate: string;
    places: TravelRecordPlace[];
  }>;
}

export interface TravelRecordComment {
  commentId: string;
  travelRecordId: string;
  authorId: string;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelRecordBookmark {
  bookmarkId: string;
  bookmarkedAt: string;
  travelRecord: TravelRecordFeedItem;
}

interface TravelRecordLikeResult {
  likeCount: number;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.buting.store'
).replace(/\/$/, '');

async function deleteRequest(path: string) {
  const authorization = getAuthorizationHeader();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authorization ? { Authorization: authorization } : undefined,
  });

  if (response.ok) return;

  if (response.status === 401 && authorization) {
    useAuthStore.getState().clearSession();
  }

  let message = '요청을 처리하지 못했어요.';
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === 'string') message = body.message;
  } catch {
    // 응답 본문이 없으면 기본 메시지를 사용합니다.
  }

  throw new ApiError(message, response.status);
}

export function getTravelRecordFeed(cursor?: string) {
  const params = new URLSearchParams({ size: '12', sort: 'LATEST' });
  if (cursor) params.set('cursor', cursor);
  return apiRequest<TravelRecordFeedPage>(`/api/v1/travel-records?${params}`);
}

export function getTravelRecordDetail(travelRecordId: string) {
  return apiRequest<TravelRecordDetail>(`/api/v1/travel-records/${travelRecordId}`);
}

export function getTravelRecordComments(travelRecordId: string) {
  return apiRequest<TravelRecordComment[]>(
    `/api/v1/travel-records/${travelRecordId}/comments`,
  );
}

export function createTravelRecordComment(travelRecordId: string, content: string) {
  return apiRequest<TravelRecordComment>(
    `/api/v1/travel-records/${travelRecordId}/comments`,
    { method: 'POST', body: JSON.stringify({ content }) },
  );
}

export function updateTravelRecordComment(
  travelRecordId: string,
  commentId: string,
  content: string,
) {
  return apiRequest<TravelRecordComment>(
    `/api/v1/travel-records/${travelRecordId}/comments/${commentId}`,
    { method: 'PATCH', body: JSON.stringify({ content }) },
  );
}

export function deleteTravelRecordComment(travelRecordId: string, commentId: string) {
  return deleteRequest(
    `/api/v1/travel-records/${travelRecordId}/comments/${commentId}`,
  );
}

export function likeTravelRecord(travelRecordId: string) {
  return apiRequest<TravelRecordLikeResult>(
    `/api/v1/travel-records/${travelRecordId}/likes`,
    { method: 'POST' },
  );
}

export function unlikeTravelRecord(travelRecordId: string) {
  return deleteRequest(`/api/v1/travel-records/${travelRecordId}/likes`);
}

export function getMyTravelRecordBookmarks() {
  return apiRequest<TravelRecordBookmark[]>('/api/v1/travel-records/me/bookmarks');
}

export function bookmarkTravelRecord(travelRecordId: string) {
  return apiRequest<TravelRecordBookmark>(
    `/api/v1/travel-records/${travelRecordId}/bookmarks`,
    { method: 'POST' },
  );
}

export function unbookmarkTravelRecord(travelRecordId: string) {
  return deleteRequest(`/api/v1/travel-records/${travelRecordId}/bookmarks`);
}
