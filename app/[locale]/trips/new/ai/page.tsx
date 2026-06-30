import { getTranslations } from 'next-intl/server';

export default async function TripNewAiPage() {
  const t = await getTranslations('trip.pages');
  return (
    <main>
      <h1>{t('newAiTitle')}</h1>
    </main>
  );
}
