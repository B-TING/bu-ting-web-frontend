'use client';
/* Local sample and uploaded file previews deliberately bypass image optimisation. */
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { Camera, Check, MapPin, RotateCcw } from 'lucide-react';
import type { AdminEventState } from '@/types/event-admin';
import { canResubmit, distanceMeters, formatEventDate, latestSubmission } from '@/lib/event-admin';
import { Action, Empty, Field, inputClass, Panel, Pill } from './AdminControls';

export default function ReviewPanel({
  state,
  now,
  review,
}: {
  state: AdminEventState;
  now: number;
  review: (id: string, approve: boolean, reason: string) => boolean;
}) {
  const [filter, setFilter] = useState('PENDING');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const list = state.participations.filter(
    (p) =>
      (filter === 'ALL' || latestSubmission(p)?.status === filter) &&
      `${p.nickname} ${state.missions.find((m) => m.id === p.missionId)?.title}`.includes(query)
  );
  const p = list.find((p) => p.id === selected) ?? list[0];
  const photo = p && latestSubmission(p);
  const round = state.rounds.find((r) => r.id === p?.roundId);
  const mission = state.missions.find((m) => m.id === p?.missionId);
  const labels = { PENDING: '검수 대기', APPROVED: '승인', REJECTED: '반려' };
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="검수 상태"
          className={`${inputClass} max-w-40`}
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setReason('');
          }}
        >
          <option value="ALL">전체 상태</option>
          {Object.entries(labels).map(([key, label]) => (
            <option
              key={key}
              value={key}
            >
              {label}
            </option>
          ))}
        </select>
        <input
          aria-label="참여자 또는 미션 검색"
          placeholder="참여자 또는 미션 검색"
          className={`${inputClass} max-w-72`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="text-sm text-slate-500">{list.length}건</span>
      </div>
      {!p || !photo || !round ? (
        <Empty>조건에 해당하는 인증이 없습니다.</Empty>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[280px_1fr]">
          <Panel>
            <h3 className="mb-4 text-sm font-bold">참여 목록</h3>
            <div className="grid gap-2">
              {list.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelected(item.id);
                    setReason('');
                  }}
                  className={`rounded-xl border p-4 text-left transition-colors ${p.id === item.id ? 'border-teal-600 bg-teal-50' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between gap-2">
                    <strong className="text-sm">{item.nickname}</strong>
                    <Pill tone={latestSubmission(item).status === 'PENDING' ? 'amber' : 'slate'}>
                      {labels[latestSubmission(item).status]}
                    </Pill>
                  </div>
                  <p className="mt-2 truncate text-xs text-slate-500">
                    {latestSubmission(item).placeName}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatEventDate(latestSubmission(item).submittedAt)}
                  </p>
                </button>
              ))}
            </div>
          </Panel>
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-teal-700">{round.name}</p>
                <h3 className="mt-1 text-xl font-bold">{p.nickname}님의 인증</h3>
                <p className="mt-2 text-sm text-slate-500">{mission?.title}</p>
              </div>
              <Pill tone={photo.status === 'APPROVED' ? 'teal' : 'amber'}>
                {labels[photo.status]}
              </Pill>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div>
                {photo.image ? (
                  <div>
                    <img
                      src={photo.image}
                      alt={`${p.nickname}의 제출 사진`}
                      className="aspect-[4/3] w-full rounded-xl object-contain bg-slate-100"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-teal-50 to-sky-100 text-teal-800">
                    <Camera
                      size={42}
                      strokeWidth={1}
                    />
                    <strong>샘플 인증</strong>
                    <p className="text-xs">실제 사용자 사진이 없는 검수 예시입니다.</p>
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  제출 {formatEventDate(photo.submittedAt)} · {p.submissions.length}번째 제출
                </p>
              </div>
              <div className="grid content-start gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <h4 className="text-sm font-bold">제출 당시 통과 조건</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{photo.condition}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <MapPin size={16} />
                    {photo.placeName}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    중심에서{' '}
                    {distanceMeters(
                      photo.latitude,
                      photo.longitude,
                      photo.targetLatitude,
                      photo.targetLongitude
                    )}
                    m / 허용 {photo.radius}m
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    제출 좌표 {photo.latitude}, {photo.longitude}
                  </p>
                  <a
                    className="mt-3 inline-block text-xs text-teal-700 underline"
                    href={`https://www.openstreetmap.org/?mlat=${photo.latitude}&mlon=${photo.longitude}#map=17/${photo.latitude}/${photo.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    제출 위치 확인 ↗
                  </a>
                </div>
                {p.reported && (
                  <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                    신고: {p.reportReason}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              {photo.status === 'PENDING' ? (
                <>
                  <Field label="반려 사유 (반려 시 필수)">
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="사용자가 다시 촬영할 수 있도록 구체적으로 작성해 주세요."
                    />
                  </Field>
                  <p className="my-3 text-xs text-slate-500">
                    승인 시 인증 성공·앨범 공개. 보상은 별도 확정합니다. 재제출 마감:{' '}
                    {formatEventDate(round.endsAt)}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Action
                      onClick={() => {
                        if (review(p.id, false, reason)) setReason('');
                      }}
                    >
                      <RotateCcw size={15} />
                      반려
                    </Action>
                    <Action
                      primary
                      onClick={() => {
                        if (review(p.id, true, '')) setReason('');
                      }}
                    >
                      <Check size={15} />
                      사진 승인
                    </Action>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  {photo.status === 'APPROVED'
                    ? '사진 승인이 완료되었습니다. 보상 관리에서 별도로 확정해 주세요.'
                    : `반려 사유: ${photo.reason} · ${canResubmit(p, round, now) ? '종료 전 다른 선택 장소에서 재제출 가능' : '회차 마감으로 재제출 불가'}`}
                </p>
              )}
            </div>
            <details className="mt-5 text-sm">
              <summary className="cursor-pointer font-medium">
                전체 제출 이력 ({p.submissions.length})
              </summary>
              <ol className="mt-3 grid gap-3">
                {p.submissions.map((s, i) => (
                  <li
                    key={s.id}
                    className="rounded-xl bg-slate-50 p-3"
                  >
                    <strong>
                      {i + 1}차 · {s.placeName}
                    </strong>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatEventDate(s.submittedAt)} · {labels[s.status]}{' '}
                      {s.reason && `· ${s.reason}`}
                    </p>
                    {s.image && (
                      <a
                        href={s.image}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-teal-700 underline"
                      >
                        제출 이미지 열기
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </details>
          </Panel>
        </div>
      )}
    </div>
  );
}
