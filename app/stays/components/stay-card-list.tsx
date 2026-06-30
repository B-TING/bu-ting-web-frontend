import { Bookmark, Star } from 'lucide-react';

import type { Stay } from '@/app/stays/types';

interface StayCardListProps {
  stays: Stay[];
  selectedStayId: string | null;
  bookmarkedIds: string[];
  onSelect: (stay: Stay) => void;
  onToggleBookmark: (stayId: string) => void;
}

export function StayCardList({
  stays,
  selectedStayId,
  bookmarkedIds,
  onSelect,
  onToggleBookmark,
}: StayCardListProps) {
  return (
    <section className="border-t border-slate-200 bg-white px-4 pb-5 pt-4">
      <p className="text-xs text-slate-500">
        지도에서 숙소를 선택하면 평점과 리뷰를 볼 수 있어요.
      </p>
      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stays.map((stay) => {
          const selected = stay.id === selectedStayId;
          const bookmarked = bookmarkedIds.includes(stay.id);

          return (
            <article
              key={stay.id}
              className={`relative w-64 shrink-0 snap-start rounded-2xl border-2 bg-white p-4 transition ${
                selected ? 'border-sky-600 shadow-md' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(stay)}
                className="block w-full pr-7 text-left"
              >
                <p className="truncate text-base font-black text-slate-950">
                  {bookmarked ? '📌 ' : ''}{stay.name}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {stay.areaLabel}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <strong>{stay.rating.toFixed(1)}</strong>
                  <span>· 리뷰 {stay.userRatingsTotal.toLocaleString()}개</span>
                </p>
              </button>
              <button
                type="button"
                aria-label={`${stay.name} 북마크 ${bookmarked ? '해제' : '추가'}`}
                aria-pressed={bookmarked}
                onClick={() => onToggleBookmark(stay.id)}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <Bookmark
                  className={`size-4 ${
                    bookmarked
                      ? 'fill-sky-600 text-sky-600'
                      : 'text-slate-400'
                  }`}
                />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
