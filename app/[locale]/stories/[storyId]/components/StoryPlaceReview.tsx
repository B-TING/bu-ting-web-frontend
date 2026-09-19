'use client';

import { usePublicPlaceReviews } from '@/hooks/use-plan-place-review';

export function StoryPlaceReview({ storyId, placeId, providerPlaceId }: {
  storyId: string;
  placeId: string;
  providerPlaceId?: string | null;
}) {
  const query = usePublicPlaceReviews(providerPlaceId);
  if (!providerPlaceId) return <p className="mt-4 text-slate-500">장소 식별 정보가 없어 후기를 조회할 수 없어요.</p>;
  if (query.isPending) return <p className="mt-4 text-slate-500" role="status">방문 후기를 불러오는 중이에요.</p>;
  if (query.isError) return (
    <div className="mt-4 text-slate-600" role="alert">
      <p>방문 후기를 불러오지 못했어요.</p>
      <button type="button" onClick={() => void query.refetch()} className="mt-2 text-sky-700 underline">다시 시도</button>
    </div>
  );
  const review = query.data.reviews.find((item) =>
    item.travelRecordId === storyId && item.travelRecordPlaceId === placeId,
  );
  if (!review) return <p className="mt-4 text-slate-600">작성된 방문 후기가 없어요.</p>;
  return (
    <div className="mt-4 space-y-3">
      <p className="font-semibold text-sky-700" aria-label={`방문 평점 ${review.rating}점`}>★ {review.rating} / 5</p>
      <p className="whitespace-pre-wrap leading-7 text-slate-700">{review.content?.trim() || '별점만 남긴 후기예요.'}</p>
      {review.tags.length > 0 && <div className="flex flex-wrap gap-2">{review.tags.map((tag) => (
        <span key={tag} className="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">{tag}</span>
      ))}</div>}
      {review.stayMinutes != null && <p className="text-sm text-slate-500">체류 시간 {review.stayMinutes}분</p>}
    </div>
  );
}
