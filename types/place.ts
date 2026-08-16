export type PlaceContentTypeId =
  | '12'
  | '14'
  | '15'
  | '25'
  | '28'
  | '32'
  | '38'
  | '39';

export type PlaceArrangeOption = 'A' | 'C' | 'D' | 'E' | 'O' | 'Q' | 'R' | 'S';

export interface PlaceListRequest {
  /** GPS X좌표, WGS84 경도 좌표 */
  mapX: number;
  /** GPS Y좌표, WGS84 위도 좌표 */
  mapY: number;
  /** 거리 반경, meter 단위, 최대 20,000m */
  radius: number;
  page?: number;
  size?: number;
  contentTypeId?: PlaceContentTypeId;
  arrange?: PlaceArrangeOption;
}

export interface Place {
  contentId: string;
  contentTypeId: PlaceContentTypeId;
  title: string;
  address: string;
  imageUrl: string;
  thumbnailUrl: string;
  longitude: number;
  latitude: number;
  regionCode: string;
  districtCode: string;
}

export interface PlaceListResponse {
  page: number;
  size: number;
  totalCount: number;
  places: Place[];
}

export interface PlaceSearchRequest {
  keyword: string;
  page?: number;
  size?: number;
}

export interface PlaceDetailRequest {
  contentId: string;
  contentTypeId: PlaceContentTypeId;
  googleSearchText?: string;
}

export interface PlaceGoogleReview {
  rating: number;
  text: string;
  authorName: string;
  relativePublishTimeDescription: string;
  publishTime: string;
}

export interface PlaceGooglePlace {
  placeId: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  openingHours: string[];
  reviews: PlaceGoogleReview[];
}

export interface PlaceDetailResponse {
  contentId: string;
  contentTypeId: PlaceContentTypeId;
  details: Record<string, string>;
  googlePlace: PlaceGooglePlace | null;
}
