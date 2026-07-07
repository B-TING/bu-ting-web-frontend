import { notFound } from 'next/navigation';

import { StoryDetail } from '@/app/[locale]/stories/[storyId]/components/StoryDetail';
import { getStoryFeedItemById } from '@/app/[locale]/stories/story-data';

interface StoryDetailPageProps {
  params: Promise<{ storyId: string }>;
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { storyId } = await params;
  const story = getStoryFeedItemById(storyId);

  if (!story) {
    notFound();
  }

  return <StoryDetail story={story} />;
}
