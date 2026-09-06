'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import type { AdminTourPlace } from '@/types/event-admin';
import { useEventAdminPlaces } from '@/hooks/use-event-admin-places';
import { Action, inputClass } from './AdminControls';

export default function TourPlaceSearch({
  index,
  select,
  excludedIds,
}: {
  index: number;
  select: (place: AdminTourPlace) => void;
  excludedIds: string[];
}) {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const query = useEventAdminPlaces(keyword, page);
  function search() {
    if (!text.trim()) return;
    if (keyword === text.trim() && page === 1) void query.refetch();
    setKeyword(text.trim());
    setPage(1);
    setOpen(true);
  }
  return (
    <div className="grid min-w-0 gap-3 rounded-xl border border-teal-100 bg-white p-3">
      <label
        className="text-xs font-semibold text-teal-800"
        htmlFor={`tour-search-${index}`}
      >
        선택 장소 {index} · 관광지 API 검색
      </label>
      <div className="flex min-w-0 gap-2">
        <input
          id={`tour-search-${index}`}
          className={`${inputClass} min-w-0`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              search();
            }
          }}
          placeholder="예: 광안리, 해운대"
        />
        <Action
          type="button"
          disabled={!text.trim() || query.isFetching}
          onClick={search}
        >
          <Search size={15} />
          검색
        </Action>
      </div>
      {open && query.isFetching && (
        <p
          role="status"
          className="text-xs text-slate-500"
        >
          관광지를 검색하고 있습니다.
        </p>
      )}
      {open && query.isError && (
        <div
          role="alert"
          className="text-xs text-rose-700"
        >
          <p>관광지 검색에 실패했습니다. {query.error.message}</p>
          <button
            type="button"
            className="mt-2 underline"
            onClick={() => void query.refetch()}
          >
            다시 시도
          </button>
        </div>
      )}
      {open && query.data && !query.isFetching && !query.isError && (
        <>
          <p className="text-xs text-slate-500">
            {query.data.totalCount}개 검색 결과 · 장소 선택 시 이름과 좌표를 가져옵니다.
          </p>
          <ul className="grid gap-2">
            {query.data.places.map((place) => {
              const duplicate = excludedIds.includes(place.contentId);
              return (
                <li key={place.contentId}>
                  <button
                    type="button"
                    disabled={duplicate}
                    onClick={() => {
                      select(place);
                      setOpen(false);
                    }}
                    className="w-full rounded-lg border border-slate-100 p-3 text-left hover:border-teal-400 hover:bg-teal-50 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <strong className="text-sm">
                      {place.title}
                      {duplicate && ' · 이미 선택됨'}
                    </strong>
                    <p className="mt-1 text-xs text-slate-500">{place.address}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      contentId {place.contentId} · {place.latitude}, {place.longitude}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
          {!query.data.places.length && (
            <p className="py-3 text-xs text-slate-500">
              검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
            </p>
          )}
          <div className="flex items-center justify-between">
            <Action
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </Action>
            <span className="text-xs text-slate-500">{page} 페이지</span>
            <Action
              type="button"
              disabled={page * query.data.size >= query.data.totalCount}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Action>
          </div>
        </>
      )}
    </div>
  );
}
