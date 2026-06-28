import { getTranslations } from 'next-intl/server';

interface TripDetailPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = await params;
  const t = await getTranslations('trip.pages');

  return (
    <main>
      <h1>{t('detailTitle')}</h1>
      <p>{tripId}</p>
    </main>
  );
}
