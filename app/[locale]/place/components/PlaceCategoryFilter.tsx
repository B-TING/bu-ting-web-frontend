import { cn } from '@/lib/utils';
import type { PlaceContentTypeId } from '@/types/place';

export const PLACE_CATEGORY_LABELS: Record<PlaceContentTypeId, string> = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제공연행사',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
};

export const PLACE_CATEGORY_EMOJIS: Record<PlaceContentTypeId, string> = {
  '12': '🏞️',
  '14': '🏛️',
  '15': '🎉',
  '25': '🚶',
  '28': '⚽',
  '32': '🏨',
  '38': '🛍️',
  '39': '🍽️',
};

export const PLACE_CATEGORY_COLORS: Record<PlaceContentTypeId, string> = {
  '12': '#3b82f6',
  '14': '#8b5cf6',
  '15': '#ec4899',
  '25': '#14b8a6',
  '28': '#f97316',
  '32': '#6366f1',
  '38': '#f59e0b',
  '39': '#ef4444',
};

const PLACE_CATEGORY_IDS = Object.keys(
  PLACE_CATEGORY_LABELS,
) as PlaceContentTypeId[];

interface PlaceCategoryFilterProps {
  selected: PlaceContentTypeId | null;
  onSelect: (contentTypeId: PlaceContentTypeId | null) => void;
}

export function PlaceCategoryFilter({
  selected,
  onSelect,
}: PlaceCategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-3 py-2">
      <CategoryChip
        label="전체"
        active={selected === null}
        onClick={() => onSelect(null)}
      />
      {PLACE_CATEGORY_IDS.map((id) => (
        <CategoryChip
          key={id}
          label={PLACE_CATEGORY_LABELS[id]}
          active={selected === id}
          onClick={() => onSelect(id)}
        />
      ))}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-gray-200 text-gray-600 hover:border-gray-300',
      )}
    >
      {label}
    </button>
  );
}
