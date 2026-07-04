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
  contentTypeId: string;
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
