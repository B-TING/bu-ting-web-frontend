export interface StoryAuthor {
  name: string;
  initial: string;
  bio: string;
}

export interface StoryComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export type StoryMediaType = 'image' | 'map' | 'cover';

export interface StoryMedia {
  id: string;
  type: StoryMediaType;
  imageUrl?: string;
  title?: string;
  description?: string;
}

export interface TravelStory {
  id: string;
  tripId: string;
  title: string;
  author: StoryAuthor;
  publishedAt: string;
  period: string;
  location: string;
  rating: number;
  description: string;
  helpfulCount: number;
  media: StoryMedia[];
  comments: StoryComment[];
}
