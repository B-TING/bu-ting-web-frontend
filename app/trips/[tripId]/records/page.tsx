interface TripRecordsPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripRecordsPage({ params }: TripRecordsPageProps) {
  const { tripId } = await params;

  return (
    <main>
      <h1>여행기록</h1>
      <p>{tripId}</p>
    </main>
  );
}
