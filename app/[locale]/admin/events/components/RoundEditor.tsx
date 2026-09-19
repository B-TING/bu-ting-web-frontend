'use client';
import { useState, type FormEvent } from 'react';
import type { AdminEventRound, AdminEventState } from '@/types/event-admin';
import { ADMIN_EVENT_ZONES } from '@/constants/event-admin';
import { fromKst, kstInput, validateRound } from '@/lib/event-admin';
import { Action, Field, inputClass, Modal } from './AdminControls';

export default function RoundEditor({
  state,
  round,
  save,
  close,
}: {
  state: AdminEventState;
  round?: AdminEventRound;
  save: (r: AdminEventRound) => void;
  close: () => void;
}) {
  const [draft, setDraft] = useState<AdminEventRound>(
    () =>
      round ?? {
        id: crypto.randomUUID(),
        name: '',
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        endsAt: new Date(Date.now() + 172800000).toISOString(),
        missionIds: [],
        cancelled: false,
        cancelledMissionIds: [],
        topN: 5,
        specialReward: '',
      }
  );
  const [start, setStart] = useState(kstInput(draft.startsAt));
  const [end, setEnd] = useState(kstInput(draft.endsAt));
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const r = { ...draft, startsAt: fromKst(start), endsAt: fromKst(end) };
      if (Date.parse(r.startsAt) <= Date.now())
        throw new Error('시작 시간은 현재보다 이후로 설정해 주세요.');
      validateRound(r, state);
      save(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장하지 못했습니다.');
    }
  }
  return (
    <Modal
      title={round ? '로테이션 편집' : '새 로테이션 만들기'}
      close={close}
    >
      <form
        onSubmit={submit}
        className="grid gap-5"
      >
        <Field label="회차명">
          <input
            required
            className={inputClass}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="시작 시간 (한국 시간)">
            <input
              required
              type="datetime-local"
              className={inputClass}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="종료 시간 (한국 시간)">
            <input
              required
              type="datetime-local"
              className={inputClass}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>
        <p className="rounded-xl bg-teal-50 p-3 text-xs leading-5 text-teal-800">
          설정한 시각에 자동 시작·종료됩니다. 신규 제출·재제출·좋아요 집계는 모두 종료 시각에
          마감합니다.
        </p>
        <div className="flex justify-between text-sm font-bold">
          <h3>구역별 미션 배정</h3>
          <span className="text-teal-700">{draft.missionIds.length} / 4 구역</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {ADMIN_EVENT_ZONES.map((zone) => (
            <Field
              key={zone.id}
              label={zone.name}
            >
              <select
                className={inputClass}
                value={
                  draft.missionIds.find(
                    (id) => state.missions.find((m) => m.id === id)?.zoneId === zone.id
                  ) ?? ''
                }
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    missionIds: [
                      ...draft.missionIds.filter(
                        (id) => state.missions.find((m) => m.id === id)?.zoneId !== zone.id
                      ),
                      ...(e.target.value ? [e.target.value] : []),
                    ],
                  })
                }
              >
                <option value="">휴식 · 미배정</option>
                {state.missions
                  .filter((m) => m.zoneId === zone.id)
                  .map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                    >
                      {m.title}
                    </option>
                  ))}
              </select>
            </Field>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <Field label="구역별 Top N">
            <input
              required
              type="number"
              min={1}
              max={1000}
              className={inputClass}
              value={draft.topN}
              onChange={(e) => setDraft({ ...draft, topN: e.target.valueAsNumber })}
            />
          </Field>
          <Field label="특별 보상 내용">
            <input
              required
              className={inputClass}
              value={draft.specialReward}
              onChange={(e) => setDraft({ ...draft, specialReward: e.target.value })}
              placeholder="관리자가 제공할 보상 입력"
            />
          </Field>
        </div>
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
          >
            로테이션 저장
          </Action>
        </div>
      </form>
    </Modal>
  );
}
