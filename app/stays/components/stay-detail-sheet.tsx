'use client';

import { Bookmark, ExternalLink, Star, X } from 'lucide-react';
import { useEffect } from 'react';

import { GoogleReviewCard } from '@/app/stays/components/google-review-card';
import type { Stay } from '@/app/stays/types';

interface StayDetailSheetProps {
  stay: Stay;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onClose: () => void;
}

function getGoogleMapsUrl(stay: Stay) {
  const params = new URLSearchParams({
    api: '1',
    query: `${stay.location.lat},${stay.location.lng}`,
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function StayDetailSheet({
  stay,
  bookmarked,
  onToggleBookmark,
  onClose,
}: StayDetailSheetProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 sm:px-6 sm:pt-16">
      <button
        type="button"
        aria-label="숙소 상세 닫기"
        className="absolute inset-0"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stay-detail-title"
        className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col rounded-t-3xl bg-slate-50 shadow-2xl sm:rounded-3xl"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300" />
        <div className="overflow-y-auto px-5 pb-5 pt-4 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="stay-detail-title" className="text-2xl font-black text-slate-950">
                  {stay.name}
                </h2>
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                  {stay.areaLabel}
                </span>
              </div>
              <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-sky-700">
                <Star className="size-4 fill-sky-600" />
                {stay.rating.toFixed(1)} · 리뷰 {stay.userRatingsTotal.toLocaleString()}개
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label={`북마크 ${bookmarked ? '해제' : '추가'}`}
                aria-pressed={bookmarked}
                onClick={onToggleBookmark}
                className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm"
              >
                <Bookmark className={`size-5 ${bookmarked ? 'fill-sky-600 text-sky-600' : 'text-slate-500'}`} />
              </button>
              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm"
              >
                <X className="size-5 text-slate-600" />
              </button>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-700">
            {stay.editorialSummary}
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <dl className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-4">
              <dt className="font-semibold text-slate-400">주소</dt>
              <dd className="font-medium text-slate-800">{stay.formattedAddress}</dd>
              <dt className="font-semibold text-slate-400">전화</dt>
              <dd className="font-medium text-slate-800">{stay.phone}</dd>
              <dt className="font-semibold text-slate-400">가격대</dt>
              <dd className="font-black tracking-widest text-slate-800">
                {stay.priceLevel ? '₩'.repeat(stay.priceLevel) : '정보 없음'}
              </dd>
              <dt className="font-semibold text-slate-400">영업 시간</dt>
              <dd>
                <strong className={stay.openingHours.openNow ? 'text-emerald-600' : 'text-red-500'}>
                  {stay.openingHours.openNow ? '영업 중' : '영업 종료'}
                </strong>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                  {stay.openingHours.weekdayDescriptions.map((description) => (
                    <li key={description}>{description}</li>
                  ))}
                </ul>
              </dd>
            </dl>
          </div>

          <div className="mt-7">
            <h3 className="text-lg font-black text-slate-950">Google 리뷰</h3>
            <p className="mt-1 text-xs text-slate-500">
              Google Maps에서 제공하는 리뷰 형식의 예시 데이터입니다.
            </p>
            <div className="mt-4 space-y-3">
              {stay.reviews.map((review) => (
                <GoogleReviewCard
                  key={`${review.authorName}-${review.relativePublishTimeDescription}`}
                  review={review}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-2 sm:rounded-b-3xl sm:px-8">
          <a
            href={getGoogleMapsUrl(stay)}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-sky-600 font-bold text-sky-700 hover:bg-sky-50"
          >
            Google 지도에서 보기 <ExternalLink className="size-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl bg-sky-700 font-bold text-white hover:bg-sky-800"
          >
            닫기
          </button>
        </div>
      </section>
    </div>
  );
}
