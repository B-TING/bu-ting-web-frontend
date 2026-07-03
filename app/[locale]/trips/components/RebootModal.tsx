'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { estimateTravel, estimateTravelAllModes } from '@/lib/travel-estimate';
import { TransitIcon } from './TransitIcon';
import { REBOOT_CANDIDATE_POOL } from './reboot-candidate-pool';
import type {
  DayItinerary,
  ItineraryItem,
  PlaceItem,
  RebootCandidateWithEstimate,
  TransitItem,
  TransitMode,
} from '@/types/itinerary';

// ─── 슬롯: 교체할 장소 또는 새 장소를 끼워 넣을 위치 ────────────────────────
type RebootSlot =
  | { kind: 'replace'; itemId: string }
  | { kind: 'insertAfter'; itemId: string };

type Step = 'select-slot' | 'select-candidate' | 'confirm';

function isPlace(item: ItineraryItem): item is PlaceItem {
  return item.type === 'place';
}

function findReferencePlace(day: DayItinerary, slot: RebootSlot): PlaceItem {
  const { items } = day;
  const anchorIndex = items.findIndex((item) => isPlace(item) && item.id === slot.itemId);

  if (slot.kind === 'insertAfter') {
    return items[anchorIndex] as PlaceItem;
  }

  // 교체 대상 기준 이전 장소를 우선 참조하고, 첫 장소라 이전이 없으면 다음 장소를 참조한다.
  for (let i = anchorIndex - 1; i >= 0; i -= 1) {
    const item = items[i];
    if (isPlace(item)) return item;
  }
  for (let i = anchorIndex + 1; i < items.length; i += 1) {
    const item = items[i];
    if (isPlace(item)) return item;
  }
  return items[anchorIndex] as PlaceItem;
}

function recalcTransitSegments(items: ItineraryItem[]): ItineraryItem[] {
  return items.map((item, idx) => {
    if (item.type !== 'transit') return item;
    const prev = items[idx - 1];
    const next = items[idx + 1];
    if (!prev || !next || !isPlace(prev) || !isPlace(next)) return item;
    const estimate = estimateTravel(prev, next, item.mode);
    return { ...item, minutes: estimate.minutes, km: estimate.km };
  });
}

function renumberPlaces(items: ItineraryItem[]): ItineraryItem[] {
  let order = 0;
  return items.map((item) => {
    if (!isPlace(item)) return item;
    order += 1;
    return { ...item, order };
  });
}

function buildNextItems(
  day: DayItinerary,
  slot: RebootSlot,
  candidate: RebootCandidateWithEstimate,
  mode: TransitMode
): ItineraryItem[] {
  const newPlace: PlaceItem = {
    type: 'place',
    id: `${candidate.id}-${Date.now()}`,
    order: 0,
    name: candidate.name,
    category: candidate.category,
    placeType: candidate.placeType,
    time: candidate.time,
    description: candidate.description,
    stayMinutes: candidate.stayMinutes,
    address: candidate.address,
    lat: candidate.lat,
    lng: candidate.lng,
  };

  let items: ItineraryItem[];
  const anchorIndex = day.items.findIndex((item) => isPlace(item) && item.id === slot.itemId);

  if (slot.kind === 'replace') {
    // 교체된 장소와 맞닿은 이동 구간은 사용자가 고른 이동수단으로 갱신한다.
    items = day.items.map((item, idx) => {
      if (isPlace(item) && item.id === slot.itemId) return newPlace;
      if (item.type === 'transit' && (idx === anchorIndex - 1 || idx === anchorIndex + 1)) {
        return { ...item, mode };
      }
      return item;
    });
  } else {
    let insertAt = anchorIndex + 1;
    if (day.items[insertAt]?.type === 'transit') insertAt += 1;
    const newTransit: TransitItem = { type: 'transit', mode, minutes: 0, km: 0 };
    items = [...day.items];
    items.splice(insertAt, 0, newTransit, newPlace);
  }

  return renumberPlaces(recalcTransitSegments(items));
}

interface RebootModalProps {
  open: boolean;
  onClose: () => void;
  day: DayItinerary;
  onApply: (nextItems: ItineraryItem[]) => void;
}

export function RebootModal({ open, onClose, day, onApply }: RebootModalProps) {
  const t = useTranslations('trip.reboot');
  const [step, setStep] = useState<Step>('select-slot');
  const [slot, setSlot] = useState<RebootSlot | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransitMode>('walk');

  const places = day.items.filter(isPlace);

  // reference: 이동시간 계산 기준점(이전/다음 장소). slotPlace: 실제 교체/기준이 되는 대상 장소.
  // replace 상황에서 대상이 첫 장소라 이전 장소가 없으면 reference !== slotPlace가 될 수 있다.
  const reference = slot ? findReferencePlace(day, slot) : null;
  const slotPlace = slot ? (day.items.find((item) => isPlace(item) && item.id === slot.itemId) as PlaceItem) : null;

  const candidates: RebootCandidateWithEstimate[] = useMemo(() => {
    if (!reference) return [];
    const existingNames = new Set(places.map((p) => p.name));
    return REBOOT_CANDIDATE_POOL
      .filter((c) => !existingNames.has(c.name))
      .map((c) => ({ ...c, estimates: estimateTravelAllModes(reference, c) }))
      .sort((a, b) => {
        const aWalk = a.estimates.find((e) => e.mode === 'walk')!.minutes;
        const bWalk = b.estimates.find((e) => e.mode === 'walk')!.minutes;
        return aWalk - bWalk;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference?.id]);

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) ?? null;

  if (!open) return null;

  const reset = () => {
    setStep('select-slot');
    setSlot(null);
    setSelectedCandidateId(null);
    setSelectedMode('walk');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePickSlot = (nextSlot: RebootSlot) => {
    setSlot(nextSlot);
    setSelectedCandidateId(null);
    setStep('select-candidate');
  };

  const handlePickCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setSelectedMode('walk');
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!slot || !selectedCandidate) return;
    onApply(buildNextItems(day, slot, selectedCandidate, selectedMode));
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            {step !== 'select-slot' && (
              <button
                type="button"
                onClick={() => setStep(step === 'confirm' ? 'select-candidate' : 'select-slot')}
                className="flex size-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              >
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-base font-bold text-gray-900">{t('modalTitle')}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200"
          >
            <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 1: 대상 선택 */}
          {step === 'select-slot' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{t('selectSlotPrompt')}</p>
              {places.map((place) => (
                <div key={place.id} className="rounded-xl border border-gray-100 p-3.5">
                  <p className="text-sm font-semibold text-gray-900">{place.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{place.time} · {place.category}</p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePickSlot({ kind: 'replace', itemId: place.id })}
                      className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600"
                    >
                      {t('replaceAction')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePickSlot({ kind: 'insertAfter', itemId: place.id })}
                      className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600"
                    >
                      {t('insertAction')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: 후보 비교 */}
          {step === 'select-candidate' && reference && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{t('referenceLabel', { name: reference.name })}</p>
              <p className="text-xs text-gray-400">{t('estimatedNote')}</p>

              {candidates.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">{t('candidateEmpty')}</p>
              )}

              <div className="space-y-2">
                {candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => handlePickCandidate(candidate.id)}
                    className="w-full rounded-xl border border-gray-100 p-3.5 text-left transition-all hover:border-blue-300 hover:bg-blue-50/50"
                  >
                    <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{candidate.placeType} · {candidate.category}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {candidate.estimates.map((estimate) => (
                        <span
                          key={estimate.mode}
                          className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          <TransitIcon mode={estimate.mode} />
                          {t(`transit.${estimate.mode}`)} {estimate.minutes}{t('minutesShort')}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 확정 */}
          {step === 'confirm' && slotPlace && slot && selectedCandidate && (
            <div className="space-y-5">
              <p className="text-sm font-semibold text-gray-900">
                {slot.kind === 'replace'
                  ? t('confirmReplaceTitle', { from: slotPlace.name, to: selectedCandidate.name })
                  : t('confirmInsertTitle', { from: slotPlace.name, to: selectedCandidate.name })}
              </p>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{selectedCandidate.name}</p>
                <p className="mt-0.5 text-xs text-gray-400">{selectedCandidate.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCandidate.estimates.map((estimate) => (
                    <button
                      key={estimate.mode}
                      type="button"
                      onClick={() => setSelectedMode(estimate.mode)}
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        selectedMode === estimate.mode
                          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-400'
                          : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                      )}
                    >
                      <TransitIcon mode={estimate.mode} />
                      {t(`transit.${estimate.mode}`)} {estimate.minutes}{t('minutesShort')} · {estimate.km}km
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700"
                >
                  {t('apply')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
