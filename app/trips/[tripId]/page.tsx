interface TripDetailPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = await params;

  return (
    <main>
      <h1>여행계획 상세</h1>
      <p>{tripId}</p>
    </main>
  );
}
