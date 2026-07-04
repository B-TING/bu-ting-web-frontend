import { cn } from '@/lib/utils';
import type { Place } from '@/types/place';

interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onClick: () => void;
}

export function PlaceCard({ place, isSelected, onClick }: PlaceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full gap-3 rounded-xl border p-3 text-left transition-all',
        isSelected
          ? 'border-blue-300 bg-blue-50/60'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm',
      )}
    >
      {place.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={place.thumbnailUrl}
          alt={place.title}
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
          이미지 없음
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {place.title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-gray-400">
          {place.address}
        </p>
      </div>
    </button>
  );
}
