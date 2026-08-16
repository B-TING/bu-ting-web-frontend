export type CompanionType = 'solo' | 'family' | 'couple' | 'friends' | 'colleagues';

export type TravelStyle =
  | 'culture_history'
  | 'nature_healing'
  | 'food_dining'
  | 'shopping'
  | 'activities'
  | 'photo_insta'
  | 'night_view';

export type TravelPace = 'relaxed' | 'balanced' | 'tight';

export type TravelConstraint =
  | 'heavy_luggage'
  | 'light_luggage'
  | 'pet'
  | 'stroller'
  | 'wheelchair'
  | 'diet_allergy'
  | 'none';

export type Attraction =
  | 'gamcheon'
  | 'haeundae'
  | 'gwangalli'
  | 'taejongdae'
  | 'jagalchi'
  | 'haedong'
  | 'songjeong'
  | 'hwangnyeong'
  | 'yongdusan'
  | 'beomeosa'
  | 'yeongdo'
  | 'moca';

export type FoodPreference =
  | 'milmyeon'
  | 'dwaeji_gukbap'
  | 'haemul_hoe'
  | 'eomuk'
  | 'patbingsu'
  | 'chimaek';

export type AccommodationStatus = 'booked' | 'candidate';

export type AccommodationRegion =
  | 'haeundae_marine'
  | 'seomyeon_bujeon'
  | 'nampo_junggu'
  | 'gwangalli'
  | 'yeongdo';

export type GenerationMethod = 'ai' | 'manual';

export interface TripWizardData {
  title: string;
  startDate: string;
  endDate: string;
  headCount: number;
  companionType: CompanionType | null;
  travelStyle: TravelStyle | null;
  pace: TravelPace | null;
  constraints: TravelConstraint[];
  attractions: Attraction[];
  foods: FoodPreference[];
  accommodationStatus: AccommodationStatus | null;
  accommodationRegions: AccommodationRegion[];
  generationMethod: GenerationMethod | null;
}
