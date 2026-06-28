export type TransitMode = '대중교통' | '차량' | '도보';

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
