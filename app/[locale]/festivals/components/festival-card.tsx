import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';

import type { Festival } from '@/app/festivals/types';

const CATEGORY_LABEL = {
  festival: 'FESTIVAL',
  exhibition: 'EXHIBITION',
} as const;

const STATUS_LABEL = {
  ongoing: null,
  'coming-soon': 'COMING SOON',
  ended: '종료된 행사입니다',
} as const;

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return `${start.getMonth() + 1}.${start.getDate()} - ${end.getMonth() + 1}.${end.getDate()}`;
}

export function FestivalCard({ festival }: { festival: Festival }) {
  const statusLabel = STATUS_LABEL[festival.status];

  return (
    <Link
      href={`/festivals/${festival.id}`}
      className="group relative block min-h-64 overflow-hidden rounded-3xl bg-slate-800 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(15,23,42,.94), rgba(15,23,42,.08) 72%), url(${festival.imageUrl})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-md px-2.5 py-1 text-[11px] font-black ${festival.category === 'festival' ? 'bg-sky-600' : 'bg-orange-500'}`}>
            {CATEGORY_LABEL[festival.category]}
          </span>
          {statusLabel ? (
            <span className={`rounded-md px-2.5 py-1 text-[11px] font-black ${festival.status === 'coming-soon' ? 'bg-violet-600' : 'bg-slate-500'}`}>
              {statusLabel}
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 text-xl font-black sm:text-2xl">{festival.title}</h2>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-200">
          <span className="flex items-center gap-1"><MapPin className="size-3.5" />{festival.venue}</span>
          <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{formatDateRange(festival.startDate, festival.endDate)}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-200">
          {festival.description}
        </p>
      </div>
    </Link>
  );
}
