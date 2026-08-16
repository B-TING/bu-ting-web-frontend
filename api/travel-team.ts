import { ApiError, apiRequest } from '@/lib/api-client';
import type {
  EmptyTravelTeamEnvelope,
  MyTravelListEnvelope,
  TravelInviteLinkInfoEnvelope,
  TravelInviteLinkInfoResponse,
  TravelInviteLinkResponse,
  TravelMemberListEnvelope,
} from '@/types/travel';

export async function getMyTravels() {
  const envelope = await apiRequest<MyTravelListEnvelope>('/api/v1/travel/team/my-travels');
  return envelope.data;
}

export async function getTravelMembers(travelId: string) {
  const envelope = await apiRequest<TravelMemberListEnvelope>(
    `/api/v1/travel/team/${travelId}/members`,
  );
  return envelope.data;
}

export async function getTravelInvite(travelId: string): Promise<TravelInviteLinkInfoResponse | null> {
  try {
    const envelope = await apiRequest<TravelInviteLinkInfoEnvelope>(
      `/api/v1/travel/team/${travelId}/invite`,
    );
    return envelope.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) return null;
    throw error;
  }
}

export function createTravelInvite(travelId: string) {
  return apiRequest<TravelInviteLinkResponse>(`/api/v1/travel/team/${travelId}/invite`, {
    method: 'POST',
  });
}

export function deleteTravelInvite(travelId: string) {
  return apiRequest<EmptyTravelTeamEnvelope>(`/api/v1/travel/team/${travelId}/invite`, {
    method: 'DELETE',
  });
}
