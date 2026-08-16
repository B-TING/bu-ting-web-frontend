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

export type ApiPlaceProvider = 'KAKAO' | 'NAVER' | 'GOOGLE';

export type ApiTransportType = 'CAR' | 'PUBLIC_TRANSPORT' | 'WALK';

export type ApiTravelTeamRole = 'LEADER' | 'MEMBER';

export interface PlanCreateRequest {
  dayNumber: number;
  visitDate: string;
}

export interface PlanResponse {
  planId: string;
  travelId: string;
  dayNumber: number;
  visitDate: string;
}

export interface PlanPlaceVisitedUpdateRequest {
  visited: boolean;
}

export interface PlanPlaceResponse {
  planPlaceId: string;
  planId: string;
  sequence: number;
  placeName: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  provider: ApiPlaceProvider;
  providerPlaceId: string;
  durationMinutes?: number | null;
  memo?: string | null;
  scheduledTime?: string | null;
  visited?: boolean | null;
}

export interface PlanRouteResponse {
  transportType: ApiTransportType;
  durationMinutes?: number | null;
  distanceMeters?: number | null;
  provider?: ApiPlaceProvider | null;
}

export interface TravelPlanPlace {
  planPlaceId: string;
  sequence: number;
  placeName: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  provider: ApiPlaceProvider;
  providerPlaceId: string;
  durationMinutes?: number | null;
  visited?: boolean | null;
  routeToNext?: PlanRouteResponse | null;
}

export interface TravelPlanDay {
  planId: string;
  dayNumber: number;
  visitDate: string;
  places: TravelPlanPlace[];
}

export interface TravelPlansResponse {
  travelId: string;
  title?: string | null;
  days: TravelPlanDay[];
}

export interface MyTravelResponse {
  travelId: string;
  title?: string | null;
  startDate: string;
  endDate: string;
  status: ApiTravelStatus;
  role: ApiTravelTeamRole;
  createdAt?: string | null;
}

export interface MyTravelListEnvelope {
  success: boolean;
  message: string;
  data: MyTravelResponse[];
}
