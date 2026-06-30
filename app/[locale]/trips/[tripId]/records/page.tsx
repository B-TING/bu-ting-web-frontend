'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TripTabHeader } from '@/features/trip/components/TripTabHeader';
import type { PlaceRecord } from '@/types/record';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TRIP = {
  title: 'B-Side of Busan',
  totalMinutes: 656,
};

const MOCK_RECORDS: PlaceRecord[] = [
  { id: 'p1', name: '해운대 해수욕장', category: '해변', rating: 4, review: '바다가 시원합니다~', tags: ['#힐링'], day: 1, date: '6/25' },
  { id: 'p2', name: '광안리', category: '해변·야경', rating: 4, review: '바다 따라 걷기 좋았어요~', tags: ['#뷰맛집', '#힐링'], day: 1, date: '6/25' },
  { id: 'p3', name: '태종대', category: '관광지', rating: 4, review: '', tags: ['#사진스팟', '#힐링', '#추천'], day: 1, date: '6/25' },
  { id: 'p4', name: '자갈치시장', category: '시장', rating: 5, review: '회가 너무 신선하고 맛있었어요!', tags: ['#맛집', '#현지음식'], day: 2, date: '6/26' },
  { id: 'p5', name: '국제시장', category: '시장', rating: 3, review: '', tags: ['#쇼핑'], day: 2, date: '6/26' },
  { id: 'p6', name: '남포동', category: '도심', rating: 0, review: '', tags: [], day: 2, date: '6/26' },
  { id: 'p7', name: '용두산 공원', category: '공원', rating: 0, review: '', tags: [], day: 3, date: '6/27' },
  { id: 'p8', name: '감천문화마을', category: '관광지', rating: 5, review: '색깔이 너무 예뻐요. 사진 명소!', tags: ['#사진스팟', '#추천'], day: 3, date: '6/27' },
];

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
  onClose,
  onSave,
}: {
  place: PlaceRecord;
  onClose: () => void;
  onSave: (id: string, rating: number, review: string, tags: string[]) => void;
}) {
  const t = useTranslations('trip.records');
  const [rating, setRating] = useState(place.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(place.review);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(place.tags);

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#?/, '#');
    if (tag !== '#' && !tags.includes(tag)) setTags((t) => [...t, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((t) => t.filter((v) => v !== tag));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-0.5">{place.category}</p>
          <h2 className="text-lg font-bold text-gray-900">{place.name}</h2>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 별점 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelRating')}</label>
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
                  <span className={n <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                </button>
              ))}
            </div>
          </div>

          {/* 후기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelReview')}</label>
            <textarea
              rows={4}
              placeholder={t('reviewPlaceholder')}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelTags')}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-700">×</button>
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
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors"
              >
                {t('addTag')}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => { onSave(place.id, rating, review, tags); onClose(); }}
            disabled={rating === 0 && !review.trim()}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-sm transition-all',
              rating > 0 || review.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {t('save')}
          </button>
          <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Place Record Card ────────────────────────────────────────────────────────

function PlaceRecordCard({
  record,
  onEdit,
}: {
  record: PlaceRecord;
  onEdit: () => void;
}) {
  const t = useTranslations('trip.records');
  const hasReview = record.rating > 0 || record.review || record.tags.length > 0;

  return (
    <div className={cn(
      'bg-white rounded-2xl border transition-all',
      hasReview ? 'border-gray-100 shadow-sm' : 'border-dashed border-gray-200'
    )}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">{record.category}</span>
              <span className="text-xs text-gray-200">·</span>
              <span className="text-xs text-gray-400">Day {record.day} · {record.date}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base">{record.name}</h3>
          </div>
          <button
            onClick={onEdit}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              hasReview
                ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {hasReview ? t('edit') : t('writeReview')}
          </button>
        </div>

        {hasReview && (
          <div className="mt-3 space-y-2">
            {record.rating > 0 && <StarDisplay rating={record.rating} />}
            {record.review && (
              <p className="text-sm text-gray-600 leading-relaxed">{record.review}</p>
            )}
            {record.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {record.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasReview && (
          <p className="mt-2 text-sm text-gray-400">{t('noReview')}</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface TripRecordsPageProps {
  params: Promise<{ tripId: string }>;
}

export default function TripRecordsPage({ params }: TripRecordsPageProps) {
  const { tripId } = use(params);
  const t = useTranslations('trip.records');

  const [records, setRecords] = useState<PlaceRecord[]>(MOCK_RECORDS);
  const [editingPlace, setEditingPlace] = useState<PlaceRecord | null>(null);

  const completedCount = records.filter((r) => r.rating > 0 || r.review || r.tags.length > 0).length;
  const totalCount = records.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);
  const allDone = completedCount === totalCount;

  const totalH = Math.floor(MOCK_TRIP.totalMinutes / 60);
  const totalM = MOCK_TRIP.totalMinutes % 60;

  const saveReview = (id: string, rating: number, review: string, tags: string[]) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, rating, review, tags } : r))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TripTabHeader
        tripTitle={MOCK_TRIP.title}
        tripId={tripId}
        backHref="/trips"
      />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* 상단 요약 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{t('title')}</h2>
          <p className="text-sm text-gray-400 mb-1">{t('desc')}</p>
          <p className="text-sm font-semibold text-blue-600 mb-5">
            {t('totalDuration', { duration: t('hours', { h: totalH, m: totalM }) })}
          </p>

          {/* 진행 현황 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {t('progressLabel', { completed: completedCount, total: totalCount })}
              </p>
              <span className="text-xs text-gray-400">{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {allDone && (
              <p className="text-xs text-blue-600 font-medium">
                {t('allDone')}
              </p>
            )}
          </div>
        </div>

        {/* 장소별 카드 목록 */}
        <div className="space-y-3">
          {records.map((record) => (
            <PlaceRecordCard
              key={record.id}
              record={record}
              onEdit={() => setEditingPlace(record)}
            />
          ))}
        </div>
      </main>

      {/* 후기 작성 모달 */}
      {editingPlace && (
        <ReviewModal
          place={editingPlace}
          onClose={() => setEditingPlace(null)}
          onSave={saveReview}
        />
      )}
    </div>
  );
}
