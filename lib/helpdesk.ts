import { getHelpdeskFestivals, getHelpdeskLockers } from '@/api/helpdesk';
import { getPlaceDetail, getPlaceList, searchPlaces } from '@/api/place-api';
import { getMyTravels } from '@/api/travel-team';
import { getTravelPlans } from '@/api/travel';
import { HELP_DESK_COPY, SUGGESTED_QUESTIONS } from '@/constants/helpdesk';
import type { HelpDeskIntent, HelpDeskLanguage } from '@/app/[locale]/ai-helpdesk/helpdesk-types';
import type { MyTravelResponse, TravelPlansResponse } from '@/types/travel';

const KEYWORDS: Record<HelpDeskIntent, string[]> = {
  emergency: ['119', '112', '비상', '긴급', '응급', 'emergency', 'urgent', 'police', '緊急', '救急', '紧急', '报警'],
  festivals: ['축제', '행사', 'festival', 'event', '祭', '节庆', '活动'],
  lockers: ['보관', '짐', '로커', 'locker', 'luggage', 'storage', 'ロッカー', '荷物', '寄存', '行李'],
  schedule: ['일정', '다음', 'schedule', 'itinerary', 'next', '予定', '行程', '下一个'],
  guide: ['해설', '설명', '소개', 'guide', 'explain', 'about', '解説', '紹介', '介绍', '讲解'],
  nearby: ['근처', '주변', '맛집', '관광', '추천', 'nearby', 'restaurant', 'recommend', '近く', '観光', '附近', '推荐'],
  unknown: [],
};

export function matchHelpDeskIntent(message: string): HelpDeskIntent {
  const text = message.toLowerCase();
  // Specific questions take precedence over the generic tourism keywords.
  return (Object.keys(KEYWORDS) as HelpDeskIntent[]).find(intent => KEYWORDS[intent].some(word => text.includes(word))) ?? 'unknown';
}

export function helpdeskToday(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export function getNextHelpdeskStop(plan: TravelPlansResponse, today = helpdeskToday()) {
  for (const day of [...plan.days].sort((a, b) => a.visitDate.localeCompare(b.visitDate))) {
    if (day.visitDate < today) continue;
    const place = [...day.places].sort((a, b) => a.sequence - b.sequence).find(item => !item.visited);
    if (place) return { day, place };
  }
  return null;
}

export function selectHelpdeskTravel(travels: MyTravelResponse[], today = helpdeskToday()) {
  return travels
    .filter(travel => travel.status !== 'COMPLETED' && travel.endDate >= today)
    .sort((a, b) =>
      Number(b.status === 'IN_PROGRESS') - Number(a.status === 'IN_PROGRESS') ||
      a.startDate.localeCompare(b.startDate),
    )[0];
}

export function formatHelpdeskLockers(response: unknown): string[] {
  const rows: unknown[] = Array.isArray(response) ? response :
    typeof response === 'object' && response !== null && 'content' in response && Array.isArray(response.content) ? response.content : [];
  return rows.flatMap(row => {
    if (typeof row !== 'object' || row === null) return [];
    const name = 'name' in row && typeof row.name === 'string' ? row.name : 'stationName' in row && typeof row.stationName === 'string' ? row.stationName : null;
    if (!name) return [];
    const detail = 'locationDetail' in row && typeof row.locationDetail === 'string' ? row.locationDetail : 'detailLocation' in row && typeof row.detailLocation === 'string' ? row.detailLocation : '';
    return [`• ${name}${detail ? ` — ${detail}` : ''}`];
  }).slice(0, 4);
}

const EMPTY = { ko: '조회된 정보가 없어요. 다른 질문을 입력해 주세요.', en: 'No results found. Try another question.', ja: '情報がありません。別の質問をお試しください。', zh: '暂无结果，请尝试其他问题。' };

/** Mobile parity: keyword routing and templated responses, without an LLM. */
export async function requestHelpDeskReply(message: string, intent: HelpDeskIntent, language: HelpDeskLanguage, signedIn: boolean): Promise<string> {
  const copy = HELP_DESK_COPY[language];
  if (intent === 'unknown') return copy.fallback;
  const heading = SUGGESTED_QUESTIONS.find(question => question.id === intent)?.label[language] ?? '';
  if (intent === 'emergency') {
    const contacts = {
      ko: '• 119 — 소방·구급\n• 112 — 경찰\n• 1330 — 관광통역·안내\n\n위험 상황에서는 119 또는 112에 먼저 연락하세요.',
      en: '• 119 — Fire & ambulance\n• 112 — Police\n• 1330 — Tourist information & interpretation\n\nIn danger, call 119 or 112 first.',
      ja: '• 119 — 消防・救急\n• 112 — 警察\n• 1330 — 観光通訳案内\n\n危険な場合は119または112へ。',
      zh: '• 119 — 消防、急救\n• 112 — 警察\n• 1330 — 旅游翻译咨询\n\n遇险请先拨打119或112。',
    };
    return `🚨 ${heading}\n\n${contacts[language]}`;
  }
  if (intent === 'festivals') {
    const today = helpdeskToday().replaceAll('-', '');
    const result = await getHelpdeskFestivals(today);
    const ongoing = result.festivals.filter(f => f.eventStartDate <= today && f.eventEndDate >= today);
    return ongoing.length ? `🎉 ${heading}\n\n${ongoing.map(f => `• ${f.title}\n  ${f.address}\n  ${f.eventStartDate} – ${f.eventEndDate}`).join('\n\n')}` : copy.noOngoingFestivals;
  }
  let next: ReturnType<typeof getNextHelpdeskStop> = null;
  if (signedIn) {
    const travels = await getMyTravels();
    const active = selectHelpdeskTravel(travels);
    if (active) next = getNextHelpdeskStop(await getTravelPlans(active.travelId));
  }
  if (intent === 'schedule') return next ? `📅 ${heading}\n\n${next.day.visitDate}\n• ${next.place.placeName}\n${next.place.address}` : copy.noPlanSchedule;
  const nextLatitude = next?.place.latitude;
  const nextLongitude = next?.place.longitude;
  const hasCoordinates = typeof nextLatitude === 'number' && Number.isFinite(nextLatitude) &&
    typeof nextLongitude === 'number' && Number.isFinite(nextLongitude);
  const latitude = hasCoordinates ? nextLatitude : 35.1796;
  const longitude = hasCoordinates ? nextLongitude : 129.0756;
  if (intent === 'lockers') {
    const lines = formatHelpdeskLockers(await getHelpdeskLockers(latitude, longitude));
    return lines.length ? `🧳 ${heading}\n\n${lines.join('\n\n')}` : EMPTY[language];
  }
  if (intent === 'nearby') {
    const results = await Promise.all((['12', '39'] as const).map(contentTypeId => getPlaceList({ mapX: longitude, mapY: latitude, radius: 20000, size: 4, contentTypeId, arrange: 'E' })));
    const places = results.flatMap(result => result.places);
    const basis = { ko: hasCoordinates ? '다음 일정 장소 기준 추천이에요.' : '부산 중심 기준 추천이에요.', en: hasCoordinates ? 'Near your next stop.' : 'Near central Busan.', ja: hasCoordinates ? '次の予定地の周辺です。' : '釜山中心部の周辺です。', zh: hasCoordinates ? '以下一个行程地点为中心。' : '以釜山市中心为中心。' };
    return places.length ? `📍 ${basis[language]}\n\n${places.map(p => `• ${p.title}\n  ${p.address}`).join('\n\n')}` : EMPTY[language];
  }
  const mentioned = ['감천', '해운대', '광안리', '태종대', '자갈치', 'Gamcheon', 'Haeundae', 'Gwangalli'].find(name => message.toLowerCase().includes(name.toLowerCase()));
  const result = await searchPlaces({ keyword: mentioned ?? next?.place.placeName ?? '감천문화마을', size: 1 });
  const place = result.places[0];
  if (!place) return EMPTY[language];
  const detail = await getPlaceDetail({ contentId: place.contentId, contentTypeId: place.contentTypeId });
  const description = (detail.details.overview ?? detail.details.infocenter ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  return `🏛 ${place.title}\n\n${description}\n\n${place.address}`;
}
