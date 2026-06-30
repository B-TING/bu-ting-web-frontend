interface LuggageDetailPageProps {
  params: Promise<{ stationId: string }>;
}

export default async function LuggageDetailPage({ params }: LuggageDetailPageProps) {
  const { stationId } = await params;

  return (
    <main>
      <h1>짐보관소 상세</h1>
      <p>{stationId}</p>
    </main>
  );
}
