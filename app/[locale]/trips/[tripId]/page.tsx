import { redirect } from 'next/navigation';

interface TripDetailPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = await params;
  redirect(`/trips?travelId=${tripId}`);
}
