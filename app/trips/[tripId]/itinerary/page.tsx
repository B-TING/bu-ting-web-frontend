interface TripItineraryPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripItineraryPage({ params }: TripItineraryPageProps) {
  const { tripId } = await params;

  return (
    <main>
      <h1>일정표</h1>
      <p>{tripId}</p>
    </main>
  );
}
