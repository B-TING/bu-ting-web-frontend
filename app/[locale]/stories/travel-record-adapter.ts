import type {
  TravelRecordDetail,
  TravelRecordFeedItem,
} from './api/travel-records';
import type { StoryFeedItem } from './story-data';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?auto=format&fit=crop&w=1200&q=80';

export function feedRecordToStory(record: TravelRecordFeedItem): StoryFeedItem {
  const date = record.publishedAt ?? record.travelStartDate ?? new Date().toISOString();
  return {
    id: record.travelRecordId,
    title: record.title ?? '제목 없는 여행기',
    subtitle: '부산 여행 기록',
    author: record.authorNickname || '여행자',
    authorBadge: (record.authorNickname || '여').slice(0, 1).toUpperCase(),
    createdAt: date,
    summary: record.content ?? '작성된 여행기 소개가 없어요.',
    rating: record.overallRating ?? 0,
    likesCount: record.likeCount,
    images: [record.coverImageUrl ?? FALLBACK_IMAGE],
    places: [],
    comments: [],
    travelPeriod: {
      startDate: record.travelStartDate ?? date,
      endDate: record.travelEndDate ?? record.travelStartDate ?? date,
    },
  };
}

export function detailRecordToStory(record: TravelRecordDetail): StoryFeedItem {
  const date = record.publishedAt ?? record.travelStartDate ?? new Date().toISOString();
  const places = record.days
    .flatMap((day) => day.places)
    .sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0))
    .map((place, index) => ({
      id: place.travelRecordPlaceId,
      name: place.placeName,
      category: place.provider ?? '장소',
      address: place.address ?? '주소 정보 없음',
      rating: record.overallRating ?? 0,
      review: place.memo ?? '작성된 장소 후기가 없어요.',
      tags: [],
      imageUrl: record.coverImageUrl ?? FALLBACK_IMAGE,
      latitude: place.latitude ?? 35.1796,
      longitude: place.longitude ?? 129.0756,
      order: place.sequence ?? index + 1,
    }));

  return {
    id: record.travelRecordId,
    title: record.title ?? '제목 없는 여행기',
    subtitle: '부산 여행 기록',
    author: '여행자',
    authorBadge: '여',
    createdAt: date,
    summary: record.content ?? '작성된 여행기 소개가 없어요.',
    rating: record.overallRating ?? 0,
    likesCount: record.likeCount,
    images: [record.coverImageUrl ?? FALLBACK_IMAGE],
    places,
    comments: [],
    travelPeriod: {
      startDate: record.travelStartDate ?? date,
      endDate: record.travelEndDate ?? record.travelStartDate ?? date,
    },
  };
}
