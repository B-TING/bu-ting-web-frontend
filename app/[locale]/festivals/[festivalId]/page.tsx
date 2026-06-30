interface FestivalDetailPageProps {
  params: Promise<{ festivalId: string }>;
}

export default async function FestivalDetailPage({ params }: FestivalDetailPageProps) {
  const { festivalId } = await params;

  return (
    <main>
      <h1>축제 상세</h1>
      <p>{festivalId}</p>
    </main>
  );
}
