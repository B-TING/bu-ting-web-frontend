import { apiRequest } from '@/lib/api-client';
import type { MyTravelListEnvelope } from '@/types/travel';

export async function getMyTravels() {
  const envelope = await apiRequest<MyTravelListEnvelope>('/api/v1/travel/team/my-travels');
  return envelope.data;
}
