import { getTranslations } from 'next-intl/server';

interface TripRebootPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripRebootPage({ params }: TripRebootPageProps) {
  const { tripId } = await params;
  const t = await getTranslations('trip.pages');

  return (
    <main>
      <h1>{t('rebootTitle')}</h1>
      <p>{tripId}</p>
    </main>
  );
}
