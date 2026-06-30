export type StayAreaId =
  | 'haeundae'
  | 'seomyeon'
  | 'nampo'
  | 'gwangan';

export interface StayLocation {
  lat: number;
  lng: number;
}

export interface StayReview {
  authorName: string;
  rating: number;
  text: string;
  relativePublishTimeDescription: string;
}

export interface StayOpeningHours {
  openNow: boolean;
  weekdayDescriptions: string[];
}

export interface Stay {
  id: string;
  internalPlaceId: string;
  googlePlaceId: string;
  name: string;
  areaId: StayAreaId;
  areaLabel: string;
  location: StayLocation;
  rating: number;
  userRatingsTotal: number;
  formattedAddress: string;
  priceLevel?: 1 | 2 | 3 | 4;
  stayType: 'hotel' | 'guest_house';
  phone: string;
  websiteUri?: string;
  openingHours: StayOpeningHours;
  editorialSummary: string;
  reviews: StayReview[];
}
