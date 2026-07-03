import { notFound } from 'next/navigation';

import { FestivalDetail } from '@/app/[locale]/festivals/[festivalId]/components/festival-detail';
import {
  getFestivalDetail,
  getFestivalSummary,
} from '@/lib/festival';

interface FestivalDetailPageProps {
  params: Promise<{ festivalId: string }>;
}

export default async function FestivalDetailPage({
  params,
}: FestivalDetailPageProps) {
  const { festivalId } = await params;

  try {
    const [summary, detail] = await Promise.all([
      getFestivalSummary(festivalId),
      getFestivalDetail(festivalId),
    ]);

    return <FestivalDetail festival={{ summary, detail }} />;
  } catch {
    notFound();
  }
}
