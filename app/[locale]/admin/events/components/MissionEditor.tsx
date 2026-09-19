'use client';
/* Local sample and uploaded file previews deliberately bypass image optimisation. */
/* eslint-disable @next/next/no-img-element */

import { useState, type FormEvent } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import type { AdminEventMission } from '@/types/event-admin';
import { ADMIN_EVENT_ZONES } from '@/constants/event-admin';
import { validateMission } from '@/lib/event-admin';
import { targetFromTourPlace, targetCoordinatesChanged } from '@/lib/event-admin-places';
import { Action, Field, inputClass, Modal } from './AdminControls';
import TourPlaceSearch from './TourPlaceSearch';

export default function MissionEditor({
  mission,
  save,
  close,
  lockedZone = false,
}: {
  mission?: AdminEventMission;
  save: (m: AdminEventMission, reason: string) => void;
  close: () => void;
  lockedZone?: boolean;
}) {
  const [draft, setDraft] = useState<AdminEventMission>(
    mission ?? {
      id: crypto.randomUUID(),
      zoneId: 'HAEUNDAE_GIJANG',
      title: '',
      condition: '',
      kind: 'PLACE_AUTH',
      places: [
        {
          id: crypto.randomUUID(),
          placeContentId: '',
          contentTypeId: '',
          name: '',
          sourceLatitude: null,
          sourceLongitude: null,
          latitude: 35.1587,
          longitude: 129.1604,
          radius: 100,
        },
      ],
      exampleImage: '',
      points: 50,
      badge: '',
    }
  );
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const field = <K extends keyof AdminEventMission>(key: K, value: AdminEventMission[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  function submit(e: FormEvent) {
    e.preventDefault();
    try {
      validateMission(draft);
      if (lockedZone && !reason.trim())
        throw new Error('연결된 미션을 변경하는 사유를 입력해 주세요.');
      save(draft, reason);
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장하지 못했습니다.');
    }
  }
  return (
    <Modal
      title={mission ? '미션 수정' : '새 미션 만들기'}
      close={close}
    >
      <form
        onSubmit={submit}
        className="grid gap-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="구역">
            <select
              className={inputClass}
              value={draft.zoneId}
              disabled={lockedZone}
              onChange={(e) => {
                const zone = ADMIN_EVENT_ZONES.find((z) => z.id === e.target.value);
                if (zone) field('zoneId', zone.id);
              }}
            >
              {ADMIN_EVENT_ZONES.map((z) => (
                <option
                  key={z.id}
                  value={z.id}
                >
                  {z.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="인증 유형">
            <select
              className={inputClass}
              value={draft.kind}
              onChange={(e) =>
                field('kind', e.target.value === 'OBJECT_AUTH' ? 'OBJECT_AUTH' : 'PLACE_AUTH')
              }
            >
              <option value="PLACE_AUTH">장소 인증</option>
              <option value="OBJECT_AUTH">사물 인증</option>
            </select>
          </Field>
        </div>
        <Field label="미션 제목">
          <input
            required
            maxLength={100}
            className={inputClass}
            value={draft.title}
            onChange={(e) => field('title', e.target.value)}
            placeholder="예: 부산 바다와 함께 사진 찍기"
          />
        </Field>
        <Field label="통과 조건 · 사용자 촬영 안내">
          <textarea
            required
            rows={3}
            maxLength={2000}
            className={inputClass}
            value={draft.condition}
            onChange={(e) => field('condition', e.target.value)}
            placeholder="사진에서 반드시 확인되어야 할 내용을 입력해 주세요."
          />
        </Field>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">선택 장소</h3>
            <p className="mt-1 text-xs text-slate-500">
              아래 장소 중 한 곳에서 수행하는 동일한 미션입니다.
            </p>
          </div>
          <Action
            type="button"
            onClick={() =>
              field('places', [
                ...draft.places,
                {
                  id: crypto.randomUUID(),
                  placeContentId: '',
                  contentTypeId: '',
                  name: '',
                  sourceLatitude: null,
                  sourceLongitude: null,
                  latitude: 35.1587,
                  longitude: 129.1604,
                  radius: 100,
                },
              ])
            }
          >
            <Plus size={15} />
            장소 추가
          </Action>
        </div>
        {draft.places.map((place, i) => (
          <div
            key={place.id}
            className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center gap-2">
              <MapPin
                size={16}
                className="text-teal-700"
              />
              <span className="text-sm font-bold">선택 장소 {i + 1}</span>
              <button
                type="button"
                className="ml-auto p-2 text-slate-500 disabled:opacity-30"
                disabled={draft.places.length === 1}
                aria-label={`선택 장소 ${i + 1} 삭제`}
                onClick={() =>
                  field(
                    'places',
                    draft.places.filter((p) => p.id !== place.id)
                  )
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
            <TourPlaceSearch
              index={i + 1}
              excludedIds={draft.places
                .filter((p) => p.id !== place.id)
                .map((p) => p.placeContentId)}
              select={(selected) =>
                field(
                  'places',
                  draft.places.map((p) =>
                    p.id === place.id ? targetFromTourPlace(p, selected) : p
                  )
                )
              }
            />
            <Field label="장소명">
              <input
                required
                readOnly
                className={inputClass}
                value={place.name}
                placeholder="관광지 검색 결과에서 선택해 주세요"
              />
            </Field>
            <p className="break-all text-xs text-slate-500">
              {place.placeContentId
                ? `관광지 contentId: ${place.placeContentId}`
                : '관광지 미연결 · 저장 전 검색 결과에서 선택해 주세요.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { key: 'latitude', label: '위도', min: -90, max: 90 },
                  { key: 'longitude', label: '경도', min: -180, max: 180 },
                  { key: 'radius', label: '허용 반경 (m)', min: 1, max: 10000 },
                ] as const
              ).map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                >
                  <input
                    required
                    disabled={!place.placeContentId}
                    type="number"
                    step={f.key === 'radius' ? 1 : 'any'}
                    min={f.min}
                    max={f.max}
                    className={inputClass}
                    value={Number.isNaN(place[f.key]) ? '' : place[f.key]}
                    onChange={(e) =>
                      field(
                        'places',
                        draft.places.map((p) =>
                          p.id === place.id ? { ...p, [f.key]: e.target.valueAsNumber } : p
                        )
                      )
                    }
                  />
                </Field>
              ))}
            </div>
            {place.sourceLatitude !== null && place.sourceLongitude !== null && (
              <div className="text-xs leading-5 text-slate-500">
                <p>
                  관광지 원본 좌표: {place.sourceLatitude}, {place.sourceLongitude}
                </p>
                <p>
                  {targetCoordinatesChanged(place)
                    ? '인증 중심 좌표가 수정되었습니다. 관광지 원본은 변경되지 않습니다.'
                    : '위도·경도를 수정해 실제 인증 위치에 맞출 수 있습니다.'}
                </p>
                {targetCoordinatesChanged(place) && (
                  <button
                    type="button"
                    className="mt-1 font-medium text-teal-700 underline"
                    onClick={() =>
                      field(
                        'places',
                        draft.places.map((p) =>
                          p.id === place.id
                            ? {
                                ...p,
                                latitude: place.sourceLatitude!,
                                longitude: place.sourceLongitude!,
                              }
                            : p
                        )
                      )
                    }
                  >
                    관광지 원본 좌표로 복원
                  </button>
                )}
              </div>
            )}
            <a
              className="text-xs text-teal-700 underline"
              target="_blank"
              rel="noreferrer"
              href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`}
            >
              지도에서 좌표 확인 ↗
            </a>
          </div>
        ))}
        <Field label="예시 이미지 (선택, JPG·PNG·WebP, 최대 2MB)">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={inputClass}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (
                !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                file.size > 2 * 1024 * 1024
              ) {
                setError('2MB 이하 JPG·PNG·WebP 이미지를 선택해 주세요.');
                return;
              }
              setLoading(true);
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') field('exampleImage', reader.result);
                setLoading(false);
              };
              reader.onerror = () => {
                setError('이미지를 읽지 못했습니다.');
                setLoading(false);
              };
              reader.readAsDataURL(file);
            }}
          />
        </Field>
        {draft.exampleImage && (
          <div>
            {/* Local file preview. */}
            <img
              src={draft.exampleImage}
              alt="미션 예시"
              className="max-h-48 rounded-xl object-contain"
            />
            <button
              type="button"
              className="mt-2 text-sm text-rose-700"
              onClick={() => field('exampleImage', '')}
            >
              이미지 제거
            </button>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="기본 포인트">
            <input
              required
              type="number"
              min={0}
              step={1}
              className={inputClass}
              value={draft.points}
              onChange={(e) => field('points', e.target.valueAsNumber)}
            />
          </Field>
          <Field label="스팟 배지 코드 (선택)">
            <input
              className={inputClass}
              value={draft.badge}
              onChange={(e) => field('badge', e.target.value)}
            />
          </Field>
        </div>
        {lockedZone && (
          <Field label="변경 사유 (기존 참여·검수 조건 보존)">
            <textarea
              required
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
        )}
        {error && (
          <p
            role="alert"
            className="text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Action
            type="button"
            onClick={close}
          >
            취소
          </Action>
          <Action
            type="submit"
            primary
            disabled={loading}
          >
            미션 저장
          </Action>
        </div>
      </form>
    </Modal>
  );
}
