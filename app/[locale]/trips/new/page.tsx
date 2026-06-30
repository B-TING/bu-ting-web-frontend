import { getTranslations } from 'next-intl/server';
import TripWizard from '@/features/trip/components/TripWizard';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trip.pages' });
  return { title: t('newTripMeta') };
}

export default function TripNewPage() {
  return <TripWizard />;
}
