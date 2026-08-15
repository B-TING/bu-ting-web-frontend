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

export function getMyProfile() {
  return apiRequest<MyProfile>('/api/v1/users/me');
}

export function updateMyProfile(request: UpdateMyProfileRequest) {
  return apiRequest<MyProfile>('/api/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}
