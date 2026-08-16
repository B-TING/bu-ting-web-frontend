export type ApiTravelStyle = 'TOURISM' | 'REST' | 'FOOD' | 'ACTIVITY' | 'SHOPPING';

export type ApiTravelPace = 'RELAXED' | 'BALANCED' | 'TIGHT';

export type ApiCompanionType = 'SOLO' | 'FRIEND' | 'COUPLE' | 'FAMILY' | 'GROUP';

export type ApiTravelStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface TravelCreateRequest {
  title?: string | null;
  startDate: string;
  endDate: string;
  hasHeavyBaggage?: boolean | null;
  hasPets?: boolean | null;
  travelStyle?: ApiTravelStyle | null;
  preferFlatTerrain?: boolean | null;
  pace?: ApiTravelPace | null;
  companionCount?: number | null;
  preferredFoods?: string | null;
  companionType?: ApiCompanionType | null;
  accommodationArea?: string | null;
}

export interface TravelResponse extends TravelCreateRequest {
  travelId: string;
  status: ApiTravelStatus;
  createdAt?: string | null;
}
