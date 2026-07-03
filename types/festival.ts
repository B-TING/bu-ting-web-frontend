export interface FestivalSummary {
  contentId: string;
  contentTypeId: string;
  title: string;
  address: string;
  imageUrl: string;
  thumbnailUrl: string;
  longitude: number;
  latitude: number;
  regionCode: string;
  districtCode: string;
  eventStartDate: string;
  eventEndDate: string;
}

export interface FestivalSearchResponse {
  eventStartDate: string;
  eventEndDate: null | string;
  page: number;
  size: number;
  totalCount: number;
  festivals: FestivalSummary[];
}

export interface GoogleReview {
  rating: number;
  text: string;
  authorName: string;
  relativePublishTimeDescription: string;
  publishTime: string;
}

export interface GooglePlaceInfo {
  placeId: string;
  rating: number;
  reviewCount: number;
  priceLevel?: string;
  openingHours?: string[];
  reviews?: GoogleReview[];
}

export interface FestivalDetailResponse {
  contentId: string;
  contentTypeId: string;
  details: Record<string, string>;
  googlePlace: GooglePlaceInfo | null;
}

export interface FestivalDetailView {
  summary: FestivalSummary | null;
  detail: FestivalDetailResponse;
}

export interface FestivalResolvedView extends FestivalDetailView {
  resolvedPosterImage: string | null;
  resolvedAddress: string | null;
  resolvedLatitude: number | null;
  resolvedLongitude: number | null;
}
