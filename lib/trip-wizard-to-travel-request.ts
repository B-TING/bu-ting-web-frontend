import type { TripWizardData } from '@/types/tripWizard';
import type {
  ApiCompanionType,
  ApiTravelPace,
  ApiTravelStyle,
  TravelCreateRequest,
} from '@/types/travel';

export const TRAVEL_STYLE_MAP: Record<TripWizardData['travelStyles'][number], ApiTravelStyle> = {
  culture_history: 'TOURISM',
  nature_healing: 'REST',
  food_dining: 'FOOD',
  shopping: 'SHOPPING',
  activities: 'ACTIVITY',
  photo_insta: 'TOURISM',
  night_view: 'TOURISM',
};

const COMPANION_TYPE_MAP: Record<NonNullable<TripWizardData['companionType']>, ApiCompanionType> = {
  solo: 'SOLO',
  family: 'FAMILY',
  couple: 'COUPLE',
  friends: 'FRIEND',
  colleagues: 'GROUP',
};

export const PACE_MAP: Record<NonNullable<TripWizardData['pace']>, ApiTravelPace> = {
  relaxed: 'RELAXED',
  balanced: 'BALANCED',
  tight: 'TIGHT',
};

interface MapOptions {
  foodLabels: string[];
  accommodationRegionLabels: string[];
}

/** 부산 지역 특화 서비스이므로 여행 지역(destination)은 고정값이다. */
const DEFAULT_DESTINATION = '부산';

export function mapTripWizardDataToTravelCreateRequest(
  data: TripWizardData,
  { foodLabels, accommodationRegionLabels }: MapOptions
): TravelCreateRequest {
  return {
    title: data.title || null,
    destination: DEFAULT_DESTINATION,
    startDate: data.startDate,
    endDate: data.endDate,
    hasHeavyBaggage: data.constraints.includes('heavy_luggage'),
    hasPets: data.constraints.includes('pet'),
    preferFlatTerrain:
      data.constraints.includes('stroller') || data.constraints.includes('wheelchair'),
    travelStyle: data.travelStyles.length > 0 ? TRAVEL_STYLE_MAP[data.travelStyles[0]] : null,
    pace: data.pace ? PACE_MAP[data.pace] : null,
    companionCount: data.headCount,
    preferredFoods: foodLabels.length > 0 ? foodLabels.join(', ') : null,
    companionType: data.companionType ? COMPANION_TYPE_MAP[data.companionType] : null,
    accommodationArea:
      accommodationRegionLabels.length > 0 ? accommodationRegionLabels.join(', ') : null,
  };
}
