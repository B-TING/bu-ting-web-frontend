import type {
  FestivalDetailResponse,
  FestivalSearchResponse,
  FestivalSummary,
} from '@/types/festival';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

const FALLBACK_FESTIVALS: FestivalSummary[] = [
  {
    contentId: '3000001',
    contentTypeId: '15',
    title: '광안리 M 드론라이트쇼',
    address: '부산광역시 수영구 광안해변로 219',
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    longitude: 129.1186,
    latitude: 35.1532,
    regionCode: '6',
    districtCode: '16',
    eventStartDate: '20260704',
    eventEndDate: '20260725',
  },
  {
    contentId: '3000002',
    contentTypeId: '15',
    title: '부산 바다축제',
    address: '부산광역시 해운대구 우동',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    longitude: 129.1589,
    latitude: 35.1587,
    regionCode: '6',
    districtCode: '15',
    eventStartDate: '20260801',
    eventEndDate: '20260803',
  },
  {
    contentId: '3000003',
    contentTypeId: '15',
    title: '부산 록 페스티벌',
    address: '부산광역시 사상구 삼락동',
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    longitude: 128.9796,
    latitude: 35.1681,
    regionCode: '6',
    districtCode: '8',
    eventStartDate: '20260912',
    eventEndDate: '20260914',
  },
];

const FALLBACK_DETAILS: Record<string, FestivalDetailResponse> = {
  '3000001': {
    contentId: '3000001',
    contentTypeId: '15',
    details: {
      eventstartdate: '20260704',
      eventenddate: '20260725',
      eventplace: '광안리 해수욕장',
      playtime: '매주 토요일 20:00, 22:00',
      sponsor1: '수영구청',
      sponsor2: '광안리 M 드론라이트쇼 추진위원회',
      bookingplace: '현장 관람',
      homepage: 'https://gwangallimdrone.co.kr',
      usetimefestival: '무료',
      subevent:
        '7월 프로그램 안내, 드론 퍼포먼스, 현장 안내 부스 운영',
    },
    googlePlace: null,
  },
};

function formatApiDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll('-', '');
}

function parseMonth(month: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(month);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;

  if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
    return null;
  }

  return new Date(year, monthIndex, 1);
}

function getMonthBoundary(month: string) {
  const baseDate = parseMonth(month) ?? new Date();
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  return {
    startDate: formatApiDate(start),
    endDate: formatApiDate(end),
  };
}

async function requestJson<T>(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 3600 },
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return (await response.json()) as T;
}

export function getMonthParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getAdjacentMonth(month: string, diff: number) {
  const baseDate = parseMonth(month) ?? new Date();
  const nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + diff, 1);

  return getMonthParam(nextDate);
}

export function getMonthLabel(month: string) {
  const baseDate = parseMonth(month) ?? new Date();

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(baseDate);
}

export async function getFestivals(month?: string) {
  const targetMonth = month ?? getMonthParam(new Date());
  const { startDate, endDate } = getMonthBoundary(targetMonth);

  try {
    const response = await requestJson<FestivalSearchResponse>(
      `${API_BASE_URL}/api/v1/places/festivals?eventStartDate=${startDate}&eventEndDate=${endDate}&page=1&size=100`,
    );

    return response.festivals;
  } catch {
    return FALLBACK_FESTIVALS.filter((festival) => {
      const festivalMonth = `${festival.eventStartDate.slice(0, 4)}-${festival.eventStartDate.slice(4, 6)}`;
      return festivalMonth === targetMonth;
    });
  }
}

export async function getFestivalSummary(contentId: string) {
  const currentYear = new Date().getFullYear();
  const candidateRanges = [
    { startDate: `${currentYear - 1}0101`, endDate: `${currentYear + 1}1231` },
    { startDate: `${currentYear - 3}0101`, endDate: `${currentYear + 3}1231` },
  ];

  for (const range of candidateRanges) {
    try {
      const response = await requestJson<FestivalSearchResponse>(
        `${API_BASE_URL}/api/v1/places/festivals?eventStartDate=${range.startDate}&eventEndDate=${range.endDate}&page=1&size=500`,
      );

      const matchedFestival = response.festivals.find(
        (festival) => festival.contentId === contentId,
      );

      if (matchedFestival) {
        return matchedFestival;
      }
    } catch {
      // 다음 범위를 계속 확인합니다.
    }
  }

  return (
    FALLBACK_FESTIVALS.find((festival) => festival.contentId === contentId) ?? null
  );
}

export async function getFestivalDetail(contentId: string) {
  try {
    return await requestJson<FestivalDetailResponse>(
      `${API_BASE_URL}/api/v1/places/${contentId}/detail?contentTypeId=15`,
    );
  } catch {
    const fallbackDetail = FALLBACK_DETAILS[contentId];

    if (!fallbackDetail) {
      throw new Error('Festival detail not found');
    }

    return fallbackDetail;
  }
}
