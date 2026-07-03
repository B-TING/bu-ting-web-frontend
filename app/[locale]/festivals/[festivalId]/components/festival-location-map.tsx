import { MapPin } from 'lucide-react';

import type { FestivalResolvedView } from '@/types/festival';

export function FestivalLocationMap({
  festival,
}: {
  festival: FestivalResolvedView;
}) {
  const { summary, resolvedLatitude, resolvedLongitude } = festival;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-sm font-semibold text-sky-700">Festival Location</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">
          {'\uD589\uC0AC \uC704\uCE58 \uC815\uBCF4'}
        </h2>
      </div>

      <div
        aria-label={`${summary?.title ?? '\uCD95\uC81C'} \uC704\uCE58 \uC548\uB0B4`}
        className="relative h-[720px] bg-[#eaf2e3]"
      >
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(148,163,184,.2)_1px,transparent_1px),linear-gradient(rgba(148,163,184,.2)_1px,transparent_1px),linear-gradient(30deg,transparent_47%,#fff_48%,#fff_51%,transparent_52%)] [background-size:48px_48px,48px_48px,180px_150px]" />
        <div className="absolute left-[12%] top-[18%] h-[3px] w-[78%] rotate-[14deg] bg-emerald-400/80" />
        <div className="absolute left-[18%] top-[60%] h-[3px] w-[70%] -rotate-[9deg] bg-amber-300/80" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-sky-700 text-xl font-black text-white shadow-lg ring-4 ring-white">
            1
          </span>
          <span className="mt-3 inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-slate-800 shadow">
            <MapPin className="size-4 text-sky-700" />
            {summary?.title ?? '\uCD95\uC81C \uC704\uCE58'}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
          {resolvedLatitude != null && resolvedLongitude != null
            ? `\uC704\uB3C4 ${resolvedLatitude}, \uACBD\uB3C4 ${resolvedLongitude}`
            : '\uC88C\uD45C \uC815\uBCF4\uAC00 \uC5C6\uC5B4 \uAE30\uBCF8 \uC9C0\uB3C4 \uBDF0\uB85C \uD45C\uC2DC \uC911'}
        </div>
      </div>
    </section>
  );
}
