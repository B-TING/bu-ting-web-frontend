import { StoryDetail } from '@/app/[locale]/stories/[storyId]/components/StoryDetail';

interface StoryDetailPageProps {
  params: Promise<{ storyId: string }>;
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { storyId } = await params;
  return <StoryDetail storyId={storyId} />;
}
