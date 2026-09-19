'use client';
import { useState } from 'react';
import { Award, Mail } from 'lucide-react';
import type { AdminEventState, AdminEventParticipation } from '@/types/event-admin';
import { EVENT_DELIVERY_LABELS } from '@/constants/event-admin';
import { formatEventDate, fromKst, kstInput, latestSubmission } from '@/lib/event-admin';
import { Action, Empty, Field, inputClass, Modal, Panel, Pill } from './AdminControls';

export default function RewardPanel({
  state,
  now,
  winner,
  advance,
  schedule,
  resolve,
}: {
  state: AdminEventState;
  now: number;
  winner: (id: string, value: boolean) => void;
  advance: (ids: string[], special: boolean) => boolean;
  schedule: (ids: string[], at: string) => void;
  resolve: (id: string, reason: string) => void;
}) {
  const [roundId, setRoundId] = useState(
    state.rounds.find((r) => Date.parse(r.endsAt) <= now)?.id ?? state.rounds[0]?.id ?? ''
  );
  const [missionId, setMissionId] = useState('');
  const [special, setSpecial] = useState(false);
  const delivery = (p: AdminEventParticipation) => (special ? p.specialDelivery : p.delivery);
  const [selected, setSelected] = useState<string[]>([]);
  const [at, setAt] = useState(kstInput(new Date(now).toISOString()));
  const [confirm, setConfirm] = useState(false);
  const [reportId, setReportId] = useState('');
  const [reason, setReason] = useState('');
  const round = state.rounds.find((r) => r.id === roundId);
  const list = state.participations
    .filter(
      (p) =>
        p.roundId === roundId &&
        (!missionId || p.missionId === missionId) &&
        latestSubmission(p)?.status === 'APPROVED'
    )
    .sort((a, b) => (b.likesAtClose ?? -1) - (a.likesAtClose ?? -1));
  const pendingReport = state.participations.find((p) => p.id === reportId);
  const first = state.participations.find((p) => selected.includes(p.id));
  const nextLabel = first
    ? {
        PENDING: '보상 확정',
        CONFIRMED: special ? '안내 메일 발송 기록' : '기본 보상 지급 완료 기록',
        EMAILED: '정보 수집 완료 기록',
        COLLECTED: '보상 발송 완료 기록',
        SENT: '완료',
      }[delivery(first)]
    : '선택 대상 처리';
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="보상 종류"
          className={`${inputClass} max-w-48`}
          value={special ? 'special' : 'base'}
          onChange={(e) => {
            setSpecial(e.target.value === 'special');
            setSelected([]);
          }}
        >
          <option value="base">기본 보상</option>
          <option value="special">Top N 특별 보상</option>
        </select>
        <select
          aria-label="보상 회차"
          className={`${inputClass} max-w-80`}
          value={roundId}
          onChange={(e) => {
            setRoundId(e.target.value);
            setMissionId('');
            setSelected([]);
          }}
        >
          {state.rounds.map((r) => (
            <option
              key={r.id}
              value={r.id}
            >
              {r.name}
            </option>
          ))}
        </select>
        <select
          aria-label="보상 미션"
          className={`${inputClass} max-w-72`}
          value={missionId}
          onChange={(e) => {
            setMissionId(e.target.value);
            setSelected([]);
          }}
        >
          <option value="">모든 구역</option>
          {round?.missionIds.map((id) => (
            <option
              key={id}
              value={id}
            >
              {state.missions.find((m) => m.id === id)?.title}
            </option>
          ))}
        </select>
      </div>
      {round && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-teal-900 p-5 text-white">
          <div>
            <p className="text-xs text-teal-200">구역별 좋아요 Top {round.topN} 특별 보상</p>
            <h3 className="mt-1 font-bold">{round.specialReward}</h3>
          </div>
          <p className="text-xs text-teal-100">
            집계 마감 {formatEventDate(round.endsAt)} · 동점은 운영자 선택
          </p>
        </div>
      )}
      <Panel>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-bold">보상 대상자</h3>
            <p className="mt-1 text-xs text-slate-500">
              사진 승인과 보상 확정은 별도입니다. 같은 상태의 대상자를 선택해 일괄 처리하세요.
            </p>
          </div>
          <Action
            primary
            disabled={!selected.length || (first && delivery(first) === 'SENT')}
            onClick={() => setConfirm(true)}
          >
            {nextLabel} ({selected.length})
          </Action>
        </div>
        {!list.length ? (
          <Empty>승인 완료된 보상 대상자가 없습니다.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500">
                <tr>
                  {[
                    '선택',
                    '참여자 / 미션',
                    '마감 좋아요',
                    '특별 보상',
                    '신고 검수',
                    '지급 예정',
                    '지급 상태',
                  ].map((s) => (
                    <th
                      key={s}
                      className="px-3 py-3 font-medium"
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-4">
                      <input
                        aria-label={`${p.nickname} 선택`}
                        type="checkbox"
                        className="size-4 accent-teal-700"
                        checked={selected.includes(p.id)}
                        disabled={delivery(p) === 'SENT' || (special && !p.topWinner)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, p.id]
                              : selected.filter((id) => id !== p.id)
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-4">
                      <strong>{p.nickname}</strong>
                      <p className="mt-1 max-w-52 truncate text-xs text-slate-400">
                        {state.missions.find((m) => m.id === p.missionId)?.title}
                      </p>
                    </td>
                    <td className="px-3 py-4 font-semibold">
                      {p.likesAtClose ?? '집계 전'}
                      {p.likesAtClose !== null &&
                        list.some(
                          (other) =>
                            other.id !== p.id &&
                            other.missionId === p.missionId &&
                            other.likesAtClose === p.likesAtClose
                        ) && <span className="ml-2 text-xs font-normal text-amber-700">동점</span>}
                    </td>
                    <td className="px-3 py-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          aria-label={`${p.nickname} Top 수상자`}
                          className="size-4 accent-teal-700"
                          checked={p.topWinner}
                          disabled={
                            !round ||
                            now < Date.parse(round.endsAt) ||
                            p.specialDelivery !== 'PENDING' ||
                            p.likesAtClose === null
                          }
                          onChange={(e) => winner(p.id, e.target.checked)}
                        />
                        <Award
                          size={16}
                          className={p.topWinner ? 'text-amber-500' : 'text-slate-300'}
                        />
                      </label>
                    </td>
                    <td className="px-3 py-4">
                      {p.reported && !p.reportResolved ? (
                        <button
                          onClick={() => {
                            setReportId(p.id);
                            setReason('');
                          }}
                          className="text-xs font-semibold text-rose-700 underline"
                        >
                          최종 검수 필요
                        </button>
                      ) : (
                        <Pill tone={p.reported ? 'teal' : 'slate'}>
                          {p.reported ? '검수 완료' : '신고 없음'}
                        </Pill>
                      )}
                    </td>
                    <td className="px-3 py-4 text-xs">
                      {p.rewardAt ? formatEventDate(p.rewardAt) : '미지정'}
                    </td>
                    <td className="px-3 py-4">
                      <Pill tone={delivery(p) === 'SENT' ? 'teal' : 'amber'}>
                        {special && !p.topWinner
                          ? '미선정'
                          : !special && p.delivery === 'CONFIRMED'
                            ? '지급 대기'
                            : !special && p.delivery === 'SENT'
                              ? '지급 완료'
                              : EVENT_DELIVERY_LABELS[delivery(p)]}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <Field label="선택 대상 지급 일정 (한국 시간)">
            <input
              type="datetime-local"
              className={inputClass}
              value={at}
              onChange={(e) => setAt(e.target.value)}
            />
          </Field>
          <Action
            disabled={!selected.length || !at}
            onClick={() => schedule(selected, fromKst(at))}
          >
            일정 적용
          </Action>
        </div>
      </Panel>
      <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <Mail
          size={19}
          className="shrink-0 text-teal-700"
        />
        <p className="leading-6">
          안내 메일 → 정보 수집 → 실제 보상 발송 순서로 처리합니다. 이 화면은 샘플 처리 기록만
          변경하며, 메일 발송·개인정보 수집·실제 지급은 수행하지 않습니다.
        </p>
      </div>
      {confirm && (
        <Modal
          title={nextLabel}
          close={() => setConfirm(false)}
        >
          <p className="text-sm leading-6">
            선택한 {selected.length}건을 <strong>{nextLabel}</strong> 상태로 처리합니다. 실제
            지급이나 메일 발송 없이 샘플 상태만 변경됩니다.
          </p>
          <ul className="my-4 grid gap-2 text-sm">
            {state.participations
              .filter((p) => selected.includes(p.id))
              .map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg bg-slate-50 p-3"
                >
                  {p.nickname} ·{' '}
                  {special
                    ? (p.specialRewardSnapshot ?? round?.specialReward)
                    : `${p.baseReward.points}P · ${p.baseReward.badge || '배지 없음'}`}
                </li>
              ))}
          </ul>
          <div className="flex justify-end gap-2">
            <Action onClick={() => setConfirm(false)}>취소</Action>
            <Action
              primary
              onClick={() => {
                if (advance(selected, special)) {
                  setConfirm(false);
                  setSelected([]);
                } else setConfirm(false);
              }}
            >
              확정
            </Action>
          </div>
        </Modal>
      )}
      {pendingReport && (
        <Modal
          title="신고 최종 검수"
          close={() => setReportId('')}
        >
          <p className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            {pendingReport.reportReason}
          </p>
          <p className="mb-4 text-sm text-slate-600">
            지급 가능으로 판단한 경우 근거를 남겨 보류를 해제하세요. 해결되지 않은 신고는 보류
            상태를 유지합니다.
          </p>
          <Field label="최종 검수 근거">
            <textarea
              className={inputClass}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <Action onClick={() => setReportId('')}>보류 유지</Action>
            <Action
              primary
              disabled={!reason.trim()}
              onClick={() => {
                resolve(reportId, reason);
                setReportId('');
              }}
            >
              검수 완료 · 지급 보류 해제
            </Action>
          </div>
        </Modal>
      )}
    </div>
  );
}
