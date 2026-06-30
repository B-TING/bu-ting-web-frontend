import { Star } from 'lucide-react';

import type { StayReview } from '@/app/stays/types';

export function GoogleReviewCard({ review }: { review: StayReview }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-bold text-slate-900">{review.authorName}</h4>
        <span className="shrink-0 text-xs text-slate-400">
          {review.relativePublishTimeDescription}
        </span>
      </div>
      <div className="mt-3 flex gap-0.5" aria-label={`별점 ${review.rating}점`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`size-4 ${
              index < review.rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{review.text}</p>
    </article>
  );
}
