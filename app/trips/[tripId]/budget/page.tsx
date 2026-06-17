interface TripBudgetPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripBudgetPage({ params }: TripBudgetPageProps) {
  const { tripId } = await params;

  return (
    <main>
      <h1>가계부</h1>
      <p>{tripId}</p>
    </main>
  );
}
