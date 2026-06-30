import { notFound } from 'next/navigation';

import { FestivalDetail } from '@/app/[locale]/festivals/[festivalId]/components/festival-detail';
import { FESTIVALS } from '@/app/[locale]/festivals/data';

interface FestivalDetailPageProps {
  params: Promise<{ festivalId: string }>;
}

export default async function FestivalDetailPage({ params }: FestivalDetailPageProps) {
  const { festivalId } = await params;
  const festival = FESTIVALS.find((item) => item.id === festivalId);

  if (!festival) notFound();

  return <FestivalDetail festival={festival} />;
}
