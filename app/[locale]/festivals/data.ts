import type { Festival } from '@/app/festivals/types';

export const FESTIVALS: Festival[] = [
  {
    id: 'gwangalli-drone-light-show',
    title: '광안리 M 드론 라이트쇼',
    category: 'exhibition',
    status: 'ongoing',
    venue: '광안리 해수욕장',
    address: '부산 수영구 광안해변로 일대',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    operatingHours: '매주 토요일 20:00 · 22:00',
    description:
      '매주 토요일 밤, 광안대교를 배경으로 펼쳐지는 화려한 드론 라이트쇼입니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85',
    location: { lat: 35.1532, lng: 129.1187 },
    commentCount: 0,
  },
  {
    id: 'haeundae-sand-festival',
    title: '해운대 모래축제',
    category: 'festival',
    status: 'ongoing',
    venue: '해운대 해수욕장',
    address: '부산 해운대구 우동',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    operatingHours: '10:00 - 22:00',
    description:
      '세계적인 모래조각 작품과 체험 부스가 가득한 부산의 대표 여름 축제입니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
    location: { lat: 35.1587, lng: 129.1604 },
    commentCount: 0,
  },
  {
    id: 'busan-food-festival',
    title: '부산 먹거리 페스티벌',
    category: 'festival',
    status: 'coming-soon',
    venue: '민락수변공원',
    address: '부산 수영구 민락수변로 일대',
    startDate: '2026-06-18',
    endDate: '2026-06-22',
    operatingHours: '11:00 - 21:00',
    description:
      '부산 대표 먹거리와 전국 미식 트럭이 한자리에 모입니다. 해산물 요리 체험과 쿠킹 클래스도 운영됩니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85',
    location: { lat: 35.1548, lng: 129.1312 },
    commentCount: 0,
  },
  {
    id: 'busan-street-dance-festival',
    title: '부산 국제 거리무용 축제',
    category: 'festival',
    status: 'ended',
    venue: '서면 놀이마루',
    address: '부산 부산진구 전포대로 일대',
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    operatingHours: '14:00 - 21:00',
    description:
      '국내외 거리무용 팀의 화려한 퍼포먼스와 저녁 공연이 특히 인기인 축제입니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85',
    location: { lat: 35.1582, lng: 129.063 },
    commentCount: 0,
  },
];
