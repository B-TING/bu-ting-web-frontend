import type { TripWizardData } from '@/types/tripWizard';
import type {
  ApiCompanionType,
  ApiTravelPace,
  ApiTravelStyle,
  TravelCreateRequest,
} from '@/types/travel';

const TRAVEL_STYLE_MAP: Record<NonNullable<TripWizardData['travelStyle']>, ApiTravelStyle> = {
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

const PACE_MAP: Record<NonNullable<TripWizardData['pace']>, ApiTravelPace> = {
  relaxed: 'RELAXED',
  balanced: 'BALANCED',
  tight: 'TIGHT',
};

interface MapOptions {
  foodLabels: string[];
  accommodationRegionLabels: string[];
}

export function mapTripWizardDataToTravelCreateRequest(
  data: TripWizardData,
  { foodLabels, accommodationRegionLabels }: MapOptions
): TravelCreateRequest {
  return {
    title: data.title || null,
    startDate: data.startDate,
    endDate: data.endDate,
    hasHeavyBaggage: data.constraints.includes('heavy_luggage'),
    hasPets: data.constraints.includes('pet'),
    preferFlatTerrain:
      data.constraints.includes('stroller') || data.constraints.includes('wheelchair'),
    travelStyle: data.travelStyle ? TRAVEL_STYLE_MAP[data.travelStyle] : null,
    pace: data.pace ? PACE_MAP[data.pace] : null,
    companionCount: data.headCount,
    preferredFoods: foodLabels.length > 0 ? foodLabels.join(', ') : null,
    companionType: data.companionType ? COMPANION_TYPE_MAP[data.companionType] : null,
    accommodationArea:
      data.accommodationStatus === 'candidate' && accommodationRegionLabels.length > 0
        ? accommodationRegionLabels.join(', ')
        : null,
  };
}
