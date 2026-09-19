import { searchPlaces } from '@/api/place-api';
import { parseAdminPlaceSearch } from '@/lib/event-admin-places';
import type { AdminTourPlaceSearch } from '@/types/event-admin';

/** Reuses the existing read-only tourist API. No admin endpoint is assumed. */
export async function searchAdminTourPlaces(
  keyword: string,
  page: number
): Promise<AdminTourPlaceSearch> {
  const response: unknown = await searchPlaces({ keyword: keyword.trim(), page, size: 5 });
  return parseAdminPlaceSearch(response);
}
