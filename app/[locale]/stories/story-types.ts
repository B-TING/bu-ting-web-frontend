export interface StoryAuthor {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
}

export interface StoryReviewItem {
  id: string;
  placeName: string;
  rating: number;
  tags: string[];
  content: string;
  visitedAt: string;
  imageUrl?: string;
}

export interface StoryComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface StoryTripImport {
  title: string;
  author: string;
  place: string;
  period: string;
}

export interface StoryItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  rating: number;
  reviewCount: number;
  helpfulCount: number;
  address: string;
  placeName: string;
  author: StoryAuthor;
  media: string[];
  mapImageUrl: string;
  routeSummary: string;
  reviews: StoryReviewItem[];
  comments: StoryComment[];
  tripImport: StoryTripImport;
}

