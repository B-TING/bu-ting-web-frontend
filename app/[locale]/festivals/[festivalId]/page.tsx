import { notFound } from 'next/navigation';

import { FestivalDetail } from '@/app/[locale]/festivals/[festivalId]/components/festival-detail';
import {
  getFestivals,
  getFestivalDetail,
  getFestivalSummary,
} from '@/lib/festival';
import type { FestivalSummary } from '@/types/festival';

interface FestivalDetailPageProps {
  params: Promise<{ festivalId: string }>;
  searchParams: Promise<{ month?: string; poster?: string }>;
}

export default async function FestivalDetailPage({
  params,
  searchParams,
}: FestivalDetailPageProps) {
  const { festivalId } = await params;
  const { month, poster } = await searchParams;

  try {
    let summary: FestivalSummary | null = null;

    if (month) {
      const monthlyFestivals = await getFestivals(month);
      summary =
        monthlyFestivals.find((festival) => festival.contentId === festivalId) ?? null;
    }

    if (!summary) {
      summary = await getFestivalSummary(festivalId);
    }

    const detail = await getFestivalDetail(festivalId);

    return (
      <FestivalDetail
        festival={{ summary, detail }}
        pageContext={{
          month,
          posterImage: poster,
        }}
      />
    );
  } catch {
    notFound();
  }
}
