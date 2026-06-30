export type FestivalCategory = 'festival' | 'exhibition';
export type FestivalStatus = 'ongoing' | 'coming-soon' | 'ended';

export interface FestivalLocation {
  lat: number;
  lng: number;
}

export interface Festival {
  id: string;
  title: string;
  category: FestivalCategory;
  status: FestivalStatus;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  operatingHours: string;
  description: string;
  imageUrl: string;
  location: FestivalLocation;
  commentCount: number;
}
