import { cn } from '@/lib/utils';
import type { LuggageStation } from '@/types/luggage';

interface LuggageStationCardProps {
  station: LuggageStation;
  isFavorite: boolean;
  onClick: () => void;
}

export function LuggageStationCard({
  station,
  isFavorite,
  onClick,
}: LuggageStationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border border-gray-100 bg-white p-4 text-left transition-all',
        'hover:border-gray-200 hover:shadow-sm',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-900">{station.name}</p>
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">
              {station.lineLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            총 보관함 {station.totalLockers}개 · {station.detailLocation}
          </p>
        </div>
        {isFavorite && <span className="shrink-0 text-yellow-400">★</span>}
      </div>
    </button>
  );
}
