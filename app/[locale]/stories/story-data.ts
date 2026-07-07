import type { StoryItem } from './story-types';

export const STORY_ITEMS: StoryItem[] = [
  {
    id: 'story-1',
    slug: 'haeundae-sunset-course',
    title: '해운대 일몰 코스 후기 모음',
    summary:
      '해운대 해수욕장, 동백섬, 더베이101 주변을 다녀온 여행자들의 후기를 모아봤어요. 사진 스팟과 동선 팁을 함께 확인해 보세요.',
    publishedAt: '2026년 7월 4일',
    rating: 4.8,
    reviewCount: 8,
    helpfulCount: 14,
    address: '부산광역시 해운대구 우동 해운대해변로 일대',
    placeName: '해운대 해수욕장',
    author: {
      id: 'author-1',
      name: 'guest',
      subtitle: 'B-Side of Busan',
      avatar: 'G',
    },
    media: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    ],
    mapImageUrl:
      'https://maps.googleapis.com/maps/api/staticmap?center=35.1587,129.1604&zoom=13&size=1200x700&maptype=roadmap&markers=color:blue%7C35.1587,129.1604',
    routeSummary: '해운대 해수욕장을 중심으로 일몰 산책 코스를 따라간 후기예요.',
    reviews: [
      {
        id: 'review-1',
        placeName: '해운대 해수욕장',
        rating: 5,
        tags: ['#일몰', '#산책', '#사진스팟'],
        content:
          '해 질 무렵에 가니까 바다 색이 정말 예뻤어요. 해변 따라 걷기 좋고 주변 카페까지 동선이 자연스럽게 이어졌어요.',
        visitedAt: '2026.06.25',
      },
      {
        id: 'review-2',
        placeName: '동백섬',
        rating: 4,
        tags: ['#조용함', '#바다뷰'],
        content:
          '사람이 아주 많지는 않아서 천천히 풍경 보기에 좋았어요. 바닷바람이 세니 얇은 겉옷 챙기면 좋아요.',
        visitedAt: '2026.06.25',
      },
      {
        id: 'review-3',
        placeName: '더베이101',
        rating: 5,
        tags: ['#야경', '#맛집'],
        content:
          '야경 사진 찍기 좋아요. 식사까지 같이 하기 좋았고 일정 마무리 장소로 잘 어울렸어요.',
        visitedAt: '2026.06.25',
      },
    ],
    comments: [
      {
        id: 'comment-1',
        author: '민지',
        content: '해운대 쪽 처음 가보는데 동선 참고하기 좋네요!',
        createdAt: '7월 5일',
      },
      {
        id: 'comment-2',
        author: '도윤',
        content: '일몰 시간대 추천 감사합니다. 야경까지 이어서 보기 좋겠어요.',
        createdAt: '7월 5일',
      },
    ],
    tripImport: {
      title: '해운대 일몰 코스',
      author: 'guest',
      place: '해운대 해수욕장',
      period: '2026-07-12 ~ 2026-07-13',
    },
  },
  {
    id: 'story-2',
    slug: 'gwangalli-night-view',
    title: '광안리 야경·카페 후기 모음',
    summary:
      '광안리 해변을 중심으로 카페, 포토존, 야경 명소를 다녀온 여행자들의 실제 후기를 모아둔 페이지예요.',
    publishedAt: '2026년 7월 6일',
    rating: 4.6,
    reviewCount: 6,
    helpfulCount: 9,
    address: '부산광역시 수영구 광안해변로 219 일대',
    placeName: '광안리 해수욕장',
    author: {
      id: 'author-2',
      name: 'haeun',
      subtitle: 'Night Walk in Busan',
      avatar: 'H',
    },
    media: [
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
    ],
    mapImageUrl:
      'https://maps.googleapis.com/maps/api/staticmap?center=35.1532,129.1186&zoom=13&size=1200x700&maptype=roadmap&markers=color:blue%7C35.1532,129.1186',
    routeSummary: '광안리 해변과 브리지 뷰 카페 위주 후기예요.',
    reviews: [
      {
        id: 'review-4',
        placeName: '광안리 해수욕장',
        rating: 5,
        tags: ['#야경', '#데이트'],
        content:
          '광안대교 조명 켜지는 시간대에 맞춰 가면 정말 예뻐요. 사진 찍는 사람도 많고 분위기가 좋아요.',
        visitedAt: '2026.06.28',
      },
      {
        id: 'review-5',
        placeName: '민락수변공원',
        rating: 4,
        tags: ['#피크닉', '#바다뷰'],
        content:
          '포장 음식 사서 잠깐 앉아 있기 좋았어요. 늦은 저녁엔 자리 찾기가 조금 어려울 수 있어요.',
        visitedAt: '2026.06.28',
      },
    ],
    comments: [
      {
        id: 'comment-3',
        author: '지수',
        content: '광안리 카페 추천도 같이 있으면 더 좋을 것 같아요.',
        createdAt: '7월 6일',
      },
    ],
    tripImport: {
      title: '광안리 야경 코스',
      author: 'haeun',
      place: '광안리 해수욕장',
      period: '2026-07-19 ~ 2026-07-19',
    },
  },
  {
    id: 'story-3',
    slug: 'taejongdae-cliff-course',
    title: '태종대 절경 코스 후기 모음',
    summary:
      '태종대 전망 포인트와 다누비열차 이용 팁, 주변 산책 루트 후기까지 한 번에 모아서 볼 수 있어요.',
    publishedAt: '2026년 7월 8일',
    rating: 4.7,
    reviewCount: 5,
    helpfulCount: 11,
    address: '부산광역시 영도구 전망로 24',
    placeName: '태종대',
    author: {
      id: 'author-3',
      name: 'roadtrip',
      subtitle: 'Cliff View Collection',
      avatar: 'R',
    },
    media: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    ],
    mapImageUrl:
      'https://maps.googleapis.com/maps/api/staticmap?center=35.0518,129.0872&zoom=13&size=1200x700&maptype=roadmap&markers=color:blue%7C35.0518,129.0872',
    routeSummary: '태종대 입구부터 전망대, 해안 절경 포인트를 따라간 후기예요.',
    reviews: [
      {
        id: 'review-6',
        placeName: '태종대 전망대',
        rating: 5,
        tags: ['#절경', '#트레킹'],
        content:
          '날씨 좋을 때 가면 시야가 탁 트여서 만족도가 높아요. 전망대 앞에서는 잠깐 대기 줄이 있을 수 있어요.',
        visitedAt: '2026.07.01',
      },
      {
        id: 'review-7',
        placeName: '다누비열차',
        rating: 4,
        tags: ['#이동편함', '#가족여행'],
        content:
          '걷는 거 부담스러우면 열차 이용이 좋아요. 주말에는 탑승 대기 시간이 조금 있었어요.',
        visitedAt: '2026.07.01',
      },
    ],
    comments: [
      {
        id: 'comment-4',
        author: '세아',
        content: '부모님 모시고 가기 괜찮을지 고민 중이었는데 도움됐어요.',
        createdAt: '7월 8일',
      },
    ],
    tripImport: {
      title: '태종대 절경 코스',
      author: 'roadtrip',
      place: '태종대',
      period: '2026-07-21 ~ 2026-07-21',
    },
  },
];

export function getStoryBySlug(slug: string) {
  return STORY_ITEMS.find((story) => story.slug === slug);
}

