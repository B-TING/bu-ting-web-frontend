import type { TripWizardData } from '@/types/tripWizard';
import type { AiPlanCreateRequest } from '@/types/travel';
import { PACE_MAP } from '@/lib/trip-wizard-to-travel-request';

interface MapOptions {
  /** data.foods 순서와 대응하는 음식 id (하이픈 표기, 예: dwaeji-gukbap) */
  foodIds: string[];
  /** data.travelStyles 순서와 대응하는 여행 목적 라벨 (한글) */
  purposeLabels: string[];
}

export function mapTripWizardDataToAiPlanRequest(
  data: TripWizardData,
  { foodIds, purposeLabels }: MapOptions
): AiPlanCreateRequest {
  return {
    selectedPlaces: data.selectedPlaces.map((place) => ({
      provider: place.provider,
      providerPlaceId: place.providerPlaceId,
      placeName: place.placeName,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      type: place.type,
    })),
    foodIds,
    schedulePace: data.pace ? PACE_MAP[data.pace] : 'BALANCED',
    purposes: purposeLabels,
    bookedAccommodation:
      data.accommodationStatus === 'booked' && data.bookedAccommodationName
        ? data.bookedAccommodationName
        : null,
    accommodationAreaIds: data.accommodationRegions,
  };
}
