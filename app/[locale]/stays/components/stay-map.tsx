import { MapPin } from 'lucide-react';

import type { Stay } from '@/app/[locale]/stays/types';

interface StayMapProps {
  stays: Stay[];
  selectedStayId: string | null;
  onSelect: (stay: Stay) => void;
}

const LAT_MIN = 35.09;
const LAT_MAX = 35.17;
const LNG_MIN = 129.02;
const LNG_MAX = 129.18;

function getMarkerPosition(stay: Stay) {
  const left = ((stay.location.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 80 + 10;
  const top = (1 - (stay.location.lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 70 + 12;

  return { left: `${left}%`, top: `${top}%` };
}

export function StayMap({ stays, selectedStayId, onSelect }: StayMapProps) {
  return (
    <section
      aria-label="부산 숙소 지도"
      className="relative min-h-[440px] flex-1 overflow-hidden bg-[#e9f0e4] sm:min-h-[560px]"
    >
      <div className="absolute inset-0 opacity-75 [background-image:linear-gradient(24deg,transparent_46%,#fff_47%,#fff_49%,transparent_50%),linear-gradient(112deg,transparent_45%,#fff_46%,#fff_49%,transparent_50%),linear-gradient(90deg,rgba(148,163,184,.17)_1px,transparent_1px),linear-gradient(rgba(148,163,184,.17)_1px,transparent_1px)] [background-size:190px_160px,230px_190px,42px_42px,42px_42px]" />
      <div className="absolute -bottom-20 -right-20 size-72 rounded-[45%] bg-sky-200/80 sm:size-96" />
      <div className="absolute left-[12%] top-[18%] h-[3px] w-[80%] rotate-[18deg] bg-amber-300/80" />
      <div className="absolute left-[22%] top-[54%] h-[3px] w-[72%] -rotate-[12deg] bg-amber-300/80" />
      <div className="absolute left-[55%] top-[8%] h-[76%] w-[3px] rotate-[9deg] bg-emerald-400/70" />

      {['해운대구', '수영구', '남구', '부산진구', '중구'].map((label, index) => (
        <span
          key={label}
          className="absolute text-xs font-semibold text-slate-500/70"
          style={{
            left: `${14 + ((index * 17) % 72)}%`,
            top: `${16 + ((index * 23) % 62)}%`,
          }}
        >
          {label}
        </span>
      ))}

      {stays.map((stay) => {
        const selected = selectedStayId === stay.id;

        return (
          <button
            key={stay.id}
            type="button"
            aria-label={`${stay.name}, 평점 ${stay.rating}`}
            aria-pressed={selected}
            onClick={() => onSelect(stay)}
            className="group absolute z-10 -translate-x-1/2 -translate-y-full"
            style={getMarkerPosition(stay)}
          >
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-black text-white shadow-lg transition group-hover:-translate-y-1 ${
                selected ? 'bg-amber-600 ring-4 ring-amber-200' : 'bg-sky-600'
              }`}
            >
              <MapPin className="size-3.5" /> {stay.rating.toFixed(1)}
            </span>
            {selected ? (
              <span className="mt-1 block max-w-36 rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-800 shadow">
                {stay.name}
              </span>
            ) : null}
          </button>
        );
      })}

      <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm">
        지도에서 숙소를 선택해 보세요
      </div>
    </section>
  );
}
