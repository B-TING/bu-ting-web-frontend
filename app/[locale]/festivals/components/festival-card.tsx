import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';

import {
  getFestivalStatus,
  getFestivalStatusMeta,
} from '@/app/[locale]/festivals/components/festival-status';
import type { FestivalSummary } from '@/types/festival';

function formatDateRange(startDate: string, endDate: string) {
  const start = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
  const end = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;
  const startValue = new Date(`${start}T00:00:00`);
  const endValue = new Date(`${end}T00:00:00`);

  return `${startValue.getMonth() + 1}.${startValue.getDate()} - ${endValue.getMonth() + 1}.${endValue.getDate()}`;
}

export function FestivalCard({
  festival,
  month,
}: {
  festival: FestivalSummary;
  month: string;
}) {
  const posterImage = festival.imageUrl || festival.thumbnailUrl;
  const status = getFestivalStatus(festival);
  const statusMeta = getFestivalStatusMeta(status);
  const detailSearchParams = new URLSearchParams();

  detailSearchParams.set('month', month);

  if (posterImage) {
    detailSearchParams.set('poster', posterImage);
  }

  return (
    <Link
      href={`/festivals/${festival.contentId}?${detailSearchParams.toString()}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        {posterImage ? (
          <img
            src={posterImage}
            alt={festival.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
            포스터 이미지 없음
          </div>
        )}
      </div>

      <div className="p-5">
        <span
          className={[
            'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
            statusMeta.className,
          ].join(' ')}
        >
          {statusMeta.label}
        </span>
        <h2 className="mt-3 line-clamp-2 text-xl font-black text-slate-950">
          {festival.title}
        </h2>

        <dl className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <dd className="line-clamp-2">{festival.address}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-slate-400" />
            <dd>{formatDateRange(festival.eventStartDate, festival.eventEndDate)}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
