import { getTranslations } from 'next-intl/server';
import { RebootFab } from '../components/RebootFab';

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
      <RebootFab tripId={tripId} />
    </main>
  );
}
