interface StoryDetailPageProps {
  params: Promise<{ storyId: string }>;
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { storyId } = await params;

  return (
    <main>
      <h1>여행기 상세</h1>
      <p>{storyId}</p>
    </main>
  );
}
