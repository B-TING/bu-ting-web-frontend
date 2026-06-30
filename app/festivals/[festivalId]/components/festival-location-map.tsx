import { MapPin } from 'lucide-react';

import type { Festival } from '@/app/festivals/types';

export function FestivalLocationMap({ festival }: { festival: Festival }) {
  return (
    <section aria-label={`${festival.title} 위치 지도`} className="relative h-80 overflow-hidden bg-[#eaf2e3] sm:h-96">
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(148,163,184,.2)_1px,transparent_1px),linear-gradient(rgba(148,163,184,.2)_1px,transparent_1px),linear-gradient(30deg,transparent_47%,#fff_48%,#fff_51%,transparent_52%)] [background-size:48px_48px,48px_48px,180px_150px]" />
      <div className="absolute left-[12%] top-[22%] h-[3px] w-[78%] rotate-[14deg] bg-emerald-400/80" />
      <div className="absolute left-[18%] top-[64%] h-[3px] w-[70%] -rotate-[9deg] bg-amber-300/80" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-sky-700 text-lg font-black text-white shadow-lg ring-4 ring-white">1</span>
        <span className="mt-2 inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow">
          <MapPin className="size-3.5 text-sky-700" /> {festival.venue}
        </span>
      </div>
      <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 shadow-sm">지도 API 연동 예정</span>
    </section>
  );
}
