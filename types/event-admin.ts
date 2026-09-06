export type EventZoneId =
  | 'HAEUNDAE_GIJANG'
  | 'SUYEONG_NAMGU'
  | 'CENTRAL_NORTH'
  | 'OLD_DOWNTOWN'
  | 'YEONGDO'
  | 'WESTERN_BUSAN';
export interface AdminEventPlace {
  id: string;
  /** Existing tourist place reference, distinct from the event target id. */
  placeContentId: string;
  contentTypeId: string;
  name: string;
  sourceLatitude: number | null;
  sourceLongitude: number | null;
  latitude: number;
  longitude: number;
  radius: number;
}
export interface AdminTourPlace {
  contentId: string;
  contentTypeId: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
}
export interface AdminTourPlaceSearch {
  places: AdminTourPlace[];
  totalCount: number;
  page: number;
  size: number;
}
export interface AdminEventMission {
  id: string;
  zoneId: EventZoneId;
  title: string;
  condition: string;
  kind: 'PLACE_AUTH' | 'OBJECT_AUTH';
  places: AdminEventPlace[];
  exampleImage: string;
  points: number;
  badge: string;
}
export interface AdminEventRound {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  missionIds: string[];
  cancelled: boolean;
  cancelledMissionIds: string[];
  topN: number;
  specialReward: string;
}
export interface AdminEventSubmission {
  id: string;
  targetId: string;
  placeContentId: string;
  placeName: string;
  submittedAt: string;
  image: string;
  latitude: number;
  longitude: number;
  targetLatitude: number;
  targetLongitude: number;
  radius: number;
  condition: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  reviewedAt?: string;
}
export type RewardDelivery = 'PENDING' | 'CONFIRMED' | 'EMAILED' | 'COLLECTED' | 'SENT';
export interface AdminEventParticipation {
  id: string;
  userId: string;
  nickname: string;
  roundId: string;
  missionId: string;
  submissions: AdminEventSubmission[];
  liveLikes: number;
  likesAtClose: number | null;
  reported: boolean;
  reportReason: string;
  baseReward: { points: number; badge: string };
  reportResolved: boolean;
  rewardAt: string;
  delivery: RewardDelivery;
  specialDelivery: RewardDelivery;
  specialRewardSnapshot?: string;
  topWinner: boolean;
  rewardSnapshot?: { points: number; badge: string; specialReward: string };
}
export interface AdminEventTitle {
  zoneId: EventZoneId;
  names: string[];
  thresholds: number[];
}
export interface AdminEventAudit {
  id: string;
  at: string;
  action: string;
  actor: string;
}
export interface AdminEventState {
  version: 1;
  rounds: AdminEventRound[];
  missions: AdminEventMission[];
  participations: AdminEventParticipation[];
  titles: AdminEventTitle[];
  audits: AdminEventAudit[];
}
