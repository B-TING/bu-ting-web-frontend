export type TransitMode = 'public' | 'car' | 'walk';

export interface PlaceItem {
  type: 'place';
  id: string;
  order: number;
  name: string;
  category: string;
  placeType: string;
  time: string;
  description: string;
  stayMinutes: number;
  address: string;
  lat: number;
  lng: number;
}

export interface TransitItem {
  type: 'transit';
  mode: TransitMode;
  minutes: number;
  km: number;
}

export type ItineraryItem = PlaceItem | TransitItem;

export interface DayItinerary {
  day: number;
  date: string;
  shortDate: string;
  dayOfWeek: string;
  estimatedDuration: string;
  items: ItineraryItem[];
}

// ─── 리부트(일정 변경) ──────────────────────────────────────────────────────
// 일정에 아직 포함되지 않은 추천/대체 후보 장소. 실제 추천 API 연동 전까지
// mock 데이터로 채워지며, place 항목과 동일한 형태를 최대한 유지한다.
export interface RebootCandidatePlace {
  id: string;
  name: string;
  category: string;
  placeType: string;
  description: string;
  address: string;
  time: string;
  stayMinutes: number;
  lat: number;
  lng: number;
}

export interface RebootTravelEstimate {
  mode: TransitMode;
  minutes: number;
  km: number;
}

export interface RebootCandidateWithEstimate extends RebootCandidatePlace {
  estimates: RebootTravelEstimate[];
}
