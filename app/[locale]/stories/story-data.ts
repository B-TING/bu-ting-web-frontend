export interface StoryPlaceReview {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  review: string;
  tags: string[];
  imageUrl: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface StoryComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface StoryTravelPeriod {
  startDate: string;
  endDate: string;
}

export interface StoryFeedItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorBadge: string;
  createdAt: string;
  summary: string;
  rating: number;
  likesCount: number;
  images: string[];
  places: StoryPlaceReview[];
  comments: StoryComment[];
  travelPeriod: StoryTravelPeriod;
}

export const STORY_FEED_ITEMS: StoryFeedItem[] = [
  {
    id: 'b-side-of-busan',
    title: 'B-Side of Busan',
    subtitle: '부산 로컬 여행 코스',
    author: 'guest',
    authorBadge: 'G',
    createdAt: '2026-06-14',
    summary:
      '해운대 해수욕장, 광안리, 태종대 등 8곳을 다녀왔어요. 각 장소 후기를 참고해 주세요!',
    rating: 4.6,
    likesCount: 1,
    images: [
      'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526481280695-3c4691e1412d?auto=format&fit=crop&w=1200&q=80',
    ],
    travelPeriod: {
      startDate: '2026-06-25',
      endDate: '2026-06-27',
    },
    places: [
      {
        id: 'haeundae',
        name: '해운대 해수욕장',
        category: '해변',
        address: '부산광역시 해운대구 우동',
        rating: 5,
        review:
          '아침 바다 풍경이 정말 좋았고, 모래사장을 따라 천천히 산책하기에도 딱 좋았어요.',
        tags: ['#바다', '#산책', '#사진스팟'],
        imageUrl:
          'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80',
        latitude: 35.1587,
        longitude: 129.1604,
        order: 1,
      },
      {
        id: 'gwangalli',
        name: '광안리 해수욕장',
        category: '해변',
        address: '부산광역시 수영구 광안해변로',
        rating: 4,
        review:
          '광안대교를 배경으로 보는 야경이 정말 인상적이었고, 밤 분위기도 무척 좋았어요.',
        tags: ['#야경', '#광안대교', '#추천'],
        imageUrl:
          'https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=1200&q=80',
        latitude: 35.1532,
        longitude: 129.1186,
        order: 2,
      },
      {
        id: 'taejongdae',
        name: '태종대',
        category: '관광지',
        address: '부산광역시 영도구 전망로 24',
        rating: 5,
        review:
          '절벽과 바다가 한눈에 보이는 부산 대표 전망 포인트라서 꼭 한 번 들러볼 만해요.',
        tags: ['#전망', '#바다뷰', '#부산여행'],
        imageUrl:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        latitude: 35.0517,
        longitude: 129.0872,
        order: 3,
      },
    ],
    comments: [
      {
        id: 'comment-1',
        author: 'guest',
        content: '멋있다! 일정 짜는 데 진짜 도움 되었어요.',
        createdAt: '2026-06-13',
      },
    ],
  },
  {
    id: 'busan-local-course',
    title: '부산 로컬 코스',
    subtitle: '부산 골목 산책 코스',
    author: 'guest',
    authorBadge: 'G',
    createdAt: '2026-06-06',
    summary:
      '감천문화마을을 천천히 둘러보며 골목 분위기를 즐긴 코스예요. 사진 찍기 좋은 포인트도 많아요.',
    rating: 5,
    likesCount: 1,
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    ],
    travelPeriod: {
      startDate: '2026-06-06',
      endDate: '2026-06-06',
    },
    places: [
      {
        id: 'gamcheon',
        name: '감천문화마을',
        category: '관광지',
        address: '부산광역시 사하구 감내2로 203',
        rating: 5,
        review:
          '골목마다 색감이 살아 있어서 천천히 걷기 좋았고, 사진 찍을 곳도 정말 많았어요.',
        tags: ['#골목산책', '#사진스팟', '#추천'],
        imageUrl:
          'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
        latitude: 35.0975,
        longitude: 129.0106,
        order: 1,
      },
    ],
    comments: [
      {
        id: 'comment-2',
        author: 'guest',
        content: '멋있다!',
        createdAt: '2026-06-13',
      },
    ],
  },
];

export function getStoryFeedItems() {
  return STORY_FEED_ITEMS;
}

export function getStoryFeedItemById(storyId: string) {
  return STORY_FEED_ITEMS.find((item) => item.id === storyId) ?? null;
}
