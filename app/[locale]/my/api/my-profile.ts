import { apiRequest } from '@/lib/api-client';

export interface MyProfile {
  userId: string;
  email: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
  provider: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface UpdateMyProfileRequest {
  nickname?: string;
  profileImageUrl?: string;
  firstName?: string;
  lastName?: string;
}

export type MyTravelRecordStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

export interface MyTravelRecord {
  travelRecordId: string;
  travelId: string | null;
  authorId: string;
  title: string | null;
  content: string | null;
  coverImageUrl: string | null;
  overallRating: number | null;
  travelStartDate: string | null;
  travelEndDate: string | null;
  status: MyTravelRecordStatus;
  publishedAt: string | null;
  likeCount: number;
  viewCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface MyTravelRecordBookmark {
  bookmarkId: string;
  bookmarkedAt: string;
  travelRecord: Omit<MyTravelRecord, 'status' | 'createdAt' | 'updatedAt'> & {
    authorNickname: string;
    likedByMe: boolean;
  };
}

interface MyTravelRecordDetail {
  days: Array<{ places: Array<{ travelRecordPlaceId: string }> }>;
}

export function getMyProfile() {
  return apiRequest<MyProfile>('/api/v1/users/me');
}

export function updateMyProfile(request: UpdateMyProfileRequest) {
  return apiRequest<MyProfile>('/api/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export function getMyTravelRecords() {
  return apiRequest<MyTravelRecord[]>('/api/v1/travel-records/me');
}

export function getMyTravelRecordBookmarks() {
  return apiRequest<MyTravelRecordBookmark[]>('/api/v1/travel-records/me/bookmarks');
}

export async function getMyVisitedPlaceCount(records: MyTravelRecord[]) {
  const details = await Promise.all(
    records.map((record) =>
      apiRequest<MyTravelRecordDetail>(
        `/api/v1/travel-records/me/${record.travelRecordId}`,
      ),
    ),
  );

  return details.reduce(
    (total, detail) =>
      total + detail.days.reduce((dayTotal, day) => dayTotal + day.places.length, 0),
    0,
  );
}
