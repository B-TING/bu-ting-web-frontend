import type { ApiTransportType, TravelPlansResponse } from '@/types/travel';
import type { DayItinerary, ItineraryItem, TransitMode } from '@/types/itinerary';
import { formatDayOfWeek, formatShortDate } from '@/lib/format-date';

const TRANSPORT_TYPE_TO_MODE: Record<ApiTransportType, TransitMode> = {
  CAR: 'car',
  PUBLIC_TRANSPORT: 'public',
  WALK: 'walk',
};

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

export function mapTravelPlansResponseToDays(response: TravelPlansResponse): DayItinerary[] {
  return response.days
    .slice()
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map((day) => {
      const places = day.places.slice().sort((a, b) => a.sequence - b.sequence);
      const items: ItineraryItem[] = [];
      let totalMinutes = 0;

      places.forEach((place, idx) => {
        const stayMinutes = place.durationMinutes ?? 0;
        totalMinutes += stayMinutes;
        items.push({
          type: 'place',
          id: place.planPlaceId,
          order: place.sequence,
          name: place.placeName,
          stayMinutes,
          address: place.address,
          lat: place.latitude ?? 0,
          lng: place.longitude ?? 0,
          providerPlaceId: place.providerPlaceId,
        });

        const route = place.routeToNext;
        if (route && idx < places.length - 1) {
          const transitMinutes = route.durationMinutes ?? 0;
          totalMinutes += transitMinutes;
          items.push({
            type: 'transit',
            mode: TRANSPORT_TYPE_TO_MODE[route.transportType],
            minutes: transitMinutes,
            km:
              route.distanceMeters != null
                ? Math.round((route.distanceMeters / 1000) * 10) / 10
                : 0,
          });
        }
      });

      return {
        day: day.dayNumber,
        date: day.visitDate,
        shortDate: formatShortDate(day.visitDate),
        dayOfWeek: formatDayOfWeek(day.visitDate),
        estimatedDuration: formatDuration(totalMinutes),
        items,
      };
    });
}
