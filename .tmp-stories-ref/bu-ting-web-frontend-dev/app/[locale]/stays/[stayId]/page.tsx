interface StayDetailPageProps {
  params: Promise<{ stayId: string }>;
}

export default async function StayDetailPage({ params }: StayDetailPageProps) {
  const { stayId } = await params;

  return (
    <main>
      <h1>숙소 상세</h1>
      <p>{stayId}</p>
    </main>
  );
}
