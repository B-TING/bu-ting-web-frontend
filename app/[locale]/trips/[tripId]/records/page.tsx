'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useMyTravels } from '@/hooks/use-my-travels';
import { useTravelPlans } from '@/hooks/use-travel-plans';
import {
  useDeletePlanPlaceReview,
  usePlanPlaceReviews,
  useSavePlanPlaceReview,
} from '@/hooks/use-plan-place-review';
import { mapTravelPlansResponseToDays } from '@/lib/travel-plans-to-itinerary';
import type { PlanPlaceReviewRequest, PlanPlaceReviewResponse } from '@/types/review';
import { TripTabHeader } from '../../components/TripTabHeader';
import { RebootFab } from '../../components/RebootFab';

interface RecordPlace {
  planPlaceId: string;
  name: string;
  address: string;
  stayMinutes: number;
  day: number;
  shortDate: string;
  dayOfWeek: string;
}

// ─── Star Rating (read-only) ──────────────────────────────────────────────────

function StarDisplay({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            size === 'sm' ? 'text-sm' : 'text-base',
            n <= rating ? 'text-yellow-400' : 'text-gray-200'
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({
  place,
  review,
  isSaving,
  isDeleting,
  onClose,
  onSave,
  onDelete,
}: {
  place: RecordPlace;
  review: PlanPlaceReviewResponse | null;
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSave: (request: PlanPlaceReviewRequest, exists: boolean) => void;
  onDelete: () => void;
}) {
  const t = useTranslations('trip.records');
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(review?.content ?? '');
  const [stayMinutes, setStayMinutes] = useState(
    String(review?.stayMinutes ?? place.stayMinutes ?? 0)
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(review?.tags ?? []);

  const busy = isSaving || isDeleting;
  const canSave = rating > 0 && !busy;

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#+/, '');
    if (tag && !tags.includes(tag)) setTags((current) => [...current, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((current) => current.filter((v) => v !== tag));

  const handleSave = () => {
    if (!canSave) return;
    const parsedStay = Number.parseInt(stayMinutes, 10);
    onSave(
      {
        rating,
        content: content.trim(),
        tags,
        stayMinutes: Number.isFinite(parsedStay) && parsedStay > 0 ? parsedStay : 0,
      },
      Boolean(review)
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 pb-4 pt-6">
          <p className="mb-0.5 text-xs text-gray-400">
            Day {place.day} · {place.dayOfWeek} {place.shortDate}
          </p>
          <h2 className="text-lg font-bold text-gray-900">{place.name}</h2>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* 별점 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('labelRating')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  <span
                    className={n <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-200'}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 후기 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('labelReview')}
            </label>
            <textarea
              rows={4}
              placeholder={t('reviewPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 체류 시간 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{t('labelStay')}</label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={stayMinutes}
              onChange={(e) => setStayMinutes(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 태그 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{t('labelTags')}</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-400 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('tagPlaceholder')}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200"
              >
                {t('addTag')}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-gray-100 px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'w-full rounded-xl py-3 text-sm font-semibold transition-all',
              canSave
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            )}
          >
            {isSaving ? `${t('save')}…` : t('save')}
          </button>
          {review && (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="w-full py-2 text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              {isDeleting ? `${t('delete')}…` : t('delete')}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Place Record Card ────────────────────────────────────────────────────────

function PlaceRecordCard({
  place,
  review,
  onEdit,
}: {
  place: RecordPlace;
  review: PlanPlaceReviewResponse | null;
  onEdit: () => void;
}) {
  const t = useTranslations('trip.records');
  const hasReview = Boolean(review);

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white transition-all',
        hasReview ? 'border-gray-100 shadow-sm' : 'border-dashed border-gray-200'
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="truncate text-xs text-gray-400">{place.address}</span>
              <span className="text-xs text-gray-200">·</span>
              <span className="shrink-0 text-xs text-gray-400">
                Day {place.day} · {place.shortDate}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900">{place.name}</h3>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              hasReview
                ? 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {hasReview ? t('edit') : t('writeReview')}
          </button>
        </div>

        {review ? (
          <div className="mt-3 space-y-2">
            {review.rating > 0 && <StarDisplay rating={review.rating} />}
            {review.content && (
              <p className="text-sm leading-relaxed text-gray-600">{review.content}</p>
            )}
            {review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {review.mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {review.mediaUrls.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="size-16 rounded-lg object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">{t('noReview')}</p>
        )}
      </div>
    </div>
  );
}

// ─── Review Modal Container (mutation 연결) ───────────────────────────────────

function ReviewModalContainer({
  tripId,
  place,
  review,
  onClose,
}: {
  tripId: string;
  place: RecordPlace;
  review: PlanPlaceReviewResponse | null;
  onClose: () => void;
}) {
  const t = useTranslations('trip.records');
  const saveReview = useSavePlanPlaceReview(tripId, place.planPlaceId);
  const deleteReview = useDeletePlanPlaceReview(tripId, place.planPlaceId);

  return (
    <ReviewModal
      place={place}
      review={review}
      isSaving={saveReview.isPending}
      isDeleting={deleteReview.isPending}
      onClose={onClose}
      onSave={(request, exists) =>
        saveReview.mutate(
          { request, exists },
          {
            onSuccess: () => {
              toast.success(t('saved'));
              onClose();
            },
            onError: () => toast.error(t('saveError')),
          }
        )
      }
      onDelete={() =>
        deleteReview.mutate(undefined, {
          onSuccess: () => {
            toast.success(t('deleted'));
            onClose();
          },
          onError: () => toast.error(t('deleteError')),
        })
      }
    />
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface TripRecordsPageProps {
  params: Promise<{ tripId: string }>;
}

export default function TripRecordsPage({ params }: TripRecordsPageProps) {
  const { tripId } = use(params);
  const t = useTranslations('trip.records');

  const travelsQuery = useMyTravels();
  const plansQuery = useTravelPlans(tripId);

  const trip = travelsQuery.data?.find((item) => item.travelId === tripId);
  const days = plansQuery.data ? mapTravelPlansResponseToDays(plansQuery.data) : [];
  const places: RecordPlace[] = days.flatMap((day) =>
    day.items
      .filter((item): item is Extract<typeof item, { type: 'place' }> => item.type === 'place')
      .map((item) => ({
        planPlaceId: item.id,
        name: item.name,
        address: item.address,
        stayMinutes: item.stayMinutes,
        day: day.day,
        shortDate: day.shortDate,
        dayOfWeek: day.dayOfWeek,
      }))
  );

  const { reviews } = usePlanPlaceReviews(
    tripId,
    places.map((place) => place.planPlaceId)
  );

  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const editingPlace = places.find((place) => place.planPlaceId === editingPlaceId) ?? null;
  const editingReview = editingPlaceId ? (reviews.get(editingPlaceId) ?? null) : null;

  const totalCount = places.length;
  const completedCount = places.filter((place) => reviews.get(place.planPlaceId)).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const totalMinutes = places.reduce((sum, place) => sum + place.stayMinutes, 0);
  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <TripTabHeader
        tripTitle={trip?.title ?? t('title')}
        tripId={tripId}
        backHref="/trips"
      />

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-bold text-gray-900">{t('title')}</h2>
          <p className="mb-1 text-sm text-gray-400">{t('desc')}</p>
          <p className="mb-5 text-sm font-semibold text-blue-600">
            {t('totalDuration', { duration: t('hours', { h: totalH, m: totalM }) })}
          </p>

          <div className="space-y-2 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {t('progressLabel', { completed: completedCount, total: totalCount })}
              </p>
              <span className="text-xs text-gray-400">{progressPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {allDone && <p className="text-xs font-medium text-blue-600">{t('allDone')}</p>}
          </div>
        </div>

        {plansQuery.isPending ? (
          <StateBox text={t('desc')} />
        ) : plansQuery.isError ? (
          <StateBox
            text={t('planLoadError')}
            error
          />
        ) : places.length === 0 ? (
          <StateBox text={t('noPlaces')} />
        ) : (
          <div className="space-y-3">
            {places.map((place) => (
              <PlaceRecordCard
                key={place.planPlaceId}
                place={place}
                review={reviews.get(place.planPlaceId) ?? null}
                onEdit={() => setEditingPlaceId(place.planPlaceId)}
              />
            ))}
          </div>
        )}
      </main>

      {editingPlace && (
        <ReviewModalContainer
          tripId={tripId}
          place={editingPlace}
          review={editingReview}
          onClose={() => setEditingPlaceId(null)}
        />
      )}

      <RebootFab tripId={tripId} />
    </div>
  );
}

function StateBox({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-10 text-center text-sm',
        error ? 'text-red-500' : 'text-gray-400'
      )}
    >
      {text}
    </div>
  );
}
