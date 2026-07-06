import { notFound } from 'next/navigation';

import StoryDetail from '../components/StoryDetail';
import { getStoryBySlug } from '../story-data';

interface StoryDetailPageProps {
  params: Promise<{ storyId: string }>;
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { storyId } = await params;
  const story = getStoryBySlug(storyId);

  if (!story) {
    notFound();
  }

  return <StoryDetail story={story} />;
}
