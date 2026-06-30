import type { TravelStory } from '@/app/stories/types';

export const STORIES: TravelStory[] = [
  {
    id: 'b-side-of-busan',
    tripId: 'b-side-of-busan',
    title: 'B-Side of Busan',
    author: {
      name: 'guest',
      initial: 'G',
      bio: '부산의 익숙한 풍경 너머를 기록하는 여행자',
    },
    publishedAt: '2026년 6월 14일',
    period: '2026-06-25 ~ 2026-06-27',
    location: '부산광역시',
    rating: 4.6,
    description:
      '해운대 해수욕장, 광안리, 태종대 등 8곳을 다녀왔어요. 각 장소 후기를 참고해 주세요!',
    helpfulCount: 0,
    media: [
      {
        id: 'b-side-1',
        type: 'image',
        imageUrl:
          'https://images.unsplash.com/photo-1570676274861-201201943d79?auto=format&fit=crop&w=1400&q=85',
        title: '광안리의 저녁',
        description: '해가 지기 시작한 광안대교',
      },
      {
        id: 'b-side-2',
        type: 'map',
        title: '여행 경로',
        description: '장소를 탭하면 지도가 해당 위치로 이동해요.',
      },
      {
        id: 'b-side-3',
        type: 'image',
        imageUrl:
          'https://images.unsplash.com/photo-1583136742615-e00d91f2b907?auto=format&fit=crop&w=1400&q=85',
        title: '해운대 산책',
      },
      {
        id: 'b-side-4',
        type: 'image',
        imageUrl:
          'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1400&q=85',
        title: '골목에서 만난 부산',
      },
      { id: 'b-side-5', type: 'cover', title: '태종대', description: '바다를 따라 걷는 오후' },
      { id: 'b-side-6', type: 'cover', title: '영도', description: '오래된 동네와 새로운 공간' },
      { id: 'b-side-7', type: 'cover', title: '다시, 부산', description: '다음 여행을 기약하며' },
    ],
    comments: [],
  },
  {
    id: 'busan-local-course',
    tripId: 'busan-local-course',
    title: '부산 로컬 코스',
    author: {
      name: 'guest',
      initial: 'G',
      bio: '현지인의 시선으로 부산을 여행합니다',
    },
    publishedAt: '2026년 6월 9일',
    period: '2026-06-09 ~ 2026-06-11',
    location: '부산 로컬 코스',
    rating: 5,
    description: '태종대 등 1곳을 다녀왔어요. 각 장소 후기를 참고해 주세요!',
    helpfulCount: 1,
    media: [
      {
        id: 'local-1',
        type: 'cover',
        title: '부산 로컬 코스',
        description: '부산 로컬 코스',
      },
      {
        id: 'local-2',
        type: 'map',
        title: '여행 경로',
        description: '태종대와 영도 골목을 잇는 하루 코스',
      },
      {
        id: 'local-3',
        type: 'image',
        imageUrl:
          'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?auto=format&fit=crop&w=1400&q=85',
        title: '태종대 바다',
      },
    ],
    comments: [
      {
        id: 'local-comment-1',
        author: 'guest',
        content: '멋있다!',
        createdAt: '6월 13일',
      },
    ],
  },
];

export function getStory(storyId: string) {
  return STORIES.find((story) => story.id === storyId);
}
