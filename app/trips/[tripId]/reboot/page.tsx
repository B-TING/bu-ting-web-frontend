interface TripRebootPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripRebootPage({ params }: TripRebootPageProps) {
  const { tripId } = await params;

  return (
    <main>
      <h1>리부트</h1>
      <p>{tripId}</p>
    </main>
  );
}
