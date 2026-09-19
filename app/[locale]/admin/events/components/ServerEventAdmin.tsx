'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { useAdminRead, useAdminWrite, useAdminPage } from '@/hooks/use-event-admin-api';
import { eventAdminRequest } from '@/api/event-admin';
import { adminBody, adminGet, isAdminRecord } from '@/lib/event-admin-api';
import {
  adminLabels,
  adminOperations,
  adminResources,
  timeField,
  textField,
} from '@/constants/event-admin-api';
import { ADMIN_EVENT_ZONES } from '@/constants/event-admin';
import type {
  AdminField,
  AdminJson,
  AdminOperation,
  AdminRecord,
  AdminResource,
} from '@/types/event-admin-api';
import { Action, Field, inputClass, Modal, Panel } from './AdminControls';
import TourPlaceSearch from './TourPlaceSearch';

const statusNames: Record<string, string> = {
  DRAFT: '초안',
  SCHEDULED: '예약됨',
  ACTIVE: '진행 중',
  CLOSED: '종료',
  SETTLED: '정산 완료',
  CANCELLED: '취소',
  UNDER_REVIEW: '검수 대기',
  SUCCESS: '인증 성공',
  FAIL: '반려',
  APPROVED: '승인',
  REJECTED: '반려',
  PENDING: '대기',
  CONFIRMED: '확정',
  SENT: '발송 완료',
  PAID: '지급 완료',
  HELD: '보류',
  NONE: '없음',
  BASE: '기본 보상',
  TOP_LIKE: '특별 보상',
  PLACE: '장소',
  OBJECT: '사물',
  PLACE_AUTH: '장소 인증',
  OBJECT_AUTH: '사물 인증',
  REGULAR: '정규',
  GUERRILLA: '게릴라',
};
function display(value: AdminJson | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? '예' : '아니요';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length}건` : '상세 정보';
  const str = String(value);
  if (/^\d{4}-\d\d-\d\dT/.test(str) && /(Z|[+-]\d\d:\d\d)$/.test(str))
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(str));
  return statusNames[str] ?? ADMIN_EVENT_ZONES.find((z) => z.id === str)?.name ?? str;
}
function ErrorNotice({ error }: { error: unknown }) {
  return (
    <p
      role="alert"
      className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
    >
      {error instanceof Error ? error.message : '요청을 처리하지 못했습니다.'}
    </p>
  );
}
function ReferenceField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: AdminField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [page, setPage] = useState(1);
  const rounds = field.key === 'roundId';
  const query = useAdminPage(
    `/admin/${rounds ? 'zone-event-rounds' : 'zone-events'}?page=${page}&size=20`
  );
  const result = query.data ?? null;
  const id = rounds ? 'roundId' : 'eventId';
  return (
    <Field label={rounds ? '회차 선택' : '미션 선택'}>
      <select
        aria-label={rounds ? '회차 선택' : '미션 선택'}
        className={inputClass}
        value={value}
        disabled={disabled || query.isPending}
        required={field.required}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">선택해 주세요</option>
        {value && !result?.items.some((r) => r[id] === value) && (
          <option value={value}>현재 선택 항목</option>
        )}
        {result?.items.map((r) => (
          <option
            key={String(r[id])}
            value={String(r[id])}
          >
            {rounds ? `${r.roundNo}회차 · ${r.name ?? ''}` : String(r.title)} · {display(r.status)}
          </option>
        ))}
      </select>
      {query.error && (
        <span
          role="alert"
          className="text-red-700"
        >
          목록을 불러오지 못했습니다.
        </span>
      )}
      <span className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          이전
        </button>
        <span>{page} 페이지</span>
        <button
          type="button"
          disabled={page >= (result?.totalPages ?? 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          다음
        </button>
      </span>
    </Field>
  );
}
function Details({ value }: { value: AdminJson }) {
  if (Array.isArray(value))
    return (
      <div className="space-y-3">
        {value.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border p-3"
          >
            <Details value={item} />
          </div>
        ))}
      </div>
    );
  if (!isAdminRecord(value)) return <span>{display(value)}</span>;
  return (
    <dl className="grid gap-3 text-sm">
      {Object.entries(value).map(([key, item]) => (
        <div
          key={key}
          className="min-w-0"
        >
          <dt className="mb-1 text-slate-500">{adminLabels[key] ?? key}</dt>
          <dd className="break-words">
            {key === 'mediaUrl' && typeof item === 'string' && /^https?:\/\//.test(item) ? (
              <a
                href={item}
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  unoptimized
                  width={640}
                  height={480}
                  src={item}
                  alt="제출된 인증 사진"
                  className="max-h-80 rounded-xl object-contain"
                />
              </a>
            ) : typeof item === 'object' && item !== null ? (
              <Details value={item} />
            ) : (
              display(item)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
function FormField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: AdminField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  if (field.key === 'roundId' || field.key === 'eventId')
    return (
      <ReferenceField
        field={field}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (field.type === 'checkbox')
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value === 'true'}
          disabled={disabled}
          onChange={(e) => onChange(String(e.target.checked))}
        />
        {field.label}
      </label>
    );
  return (
    <Field label={field.label}>
      {field.options ? (
        <select
          aria-label={field.label}
          className={inputClass}
          value={value}
          disabled={disabled}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">선택해 주세요</option>
          {field.options.map((o) => (
            <option
              key={o.value}
              value={o.value}
            >
              {statusNames[o.value] ?? o.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          aria-label={field.label}
          className={inputClass}
          value={value}
          disabled={disabled}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-label={field.label}
          className={inputClass}
          type={field.type ?? 'text'}
          step={field.type === 'number' ? 'any' : undefined}
          value={value}
          disabled={disabled || field.readonly}
          required={field.required}
          min={field.min}
          max={field.max}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

function OperationForm({ operation, onClose }: { operation: AdminOperation; onClose: () => void }) {
  const fields = operation.fields ?? [];
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((f) => {
        const initial = adminGet(operation.initial ?? {}, f.key);
        let value =
          initial === null || typeof initial === 'object' ? (f.value ?? '') : String(initial);
        if (f.type === 'datetime-local' && value)
          value = new Date(Date.parse(value) + 9 * 3600000).toISOString().slice(0, 16);
        return [f.key, value];
      })
    )
  );
  const [place, setPlace] = useState<AdminRecord | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [uploading, setUploading] = useState(false);
  const [recoverEvent, setRecoverEvent] = useState<string | null>(null);
  const mutation = useAdminWrite();
  const requestIdentity = useRef<{ fingerprint: string; key: string } | null>(null);
  const locked = useRef(false);
  const set = (key: string, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };
  async function submit() {
    if (locked.current || uploading) return;
    locked.current = true;
    setError(null);
    try {
      const body = adminBody(fields, values, operation.fixed);
      if (operation.placeRequired && !place)
        throw new Error('관광지 검색 결과에서 장소를 선택해 주세요.');
      if (
        body.startsAt &&
        body.endsAt &&
        Date.parse(String(body.endsAt)) <= Date.parse(String(body.startsAt))
      )
        throw new Error('종료 시각은 시작 시각 이후여야 합니다.');
      if (place) {
        const target = operation.placePrefix ? body[operation.placePrefix] : body;
        if (isAdminRecord(target)) Object.assign(target, place);
      }
      // Create currently uses the legacy target DTO. Bind contentId through the supported replacement endpoint.
      if (
        operation.path === '/admin/zone-events' &&
        operation.method === 'POST' &&
        isAdminRecord(body.authTarget)
      ) {
        body.authTarget.targetKind = body.typeCode === 'OBJECT_AUTH' ? 'OBJECT' : 'PLACE';
        if (body.typeCode === 'OBJECT_AUTH' && !body.authTarget.landmarkId)
          throw new Error('사물 인증에는 운영 대상의 랜드마크 식별자를 입력해 주세요.');
      }
      const fingerprint = JSON.stringify([operation.path, operation.method, body]);
      if (requestIdentity.current?.fingerprint !== fingerprint)
        requestIdentity.current = { fingerprint, key: crypto.randomUUID() };
      const result = await mutation.mutateAsync({
        path: operation.path,
        method: operation.method,
        body,
        key: requestIdentity.current.key,
      });
      if (
        operation.path === '/admin/zone-events' &&
        operation.method === 'POST' &&
        isAdminRecord(result) &&
        place &&
        body.typeCode === 'PLACE_AUTH'
      ) {
        const target = result.authTarget;
        if (!isAdminRecord(target) || !target.targetId || !result.eventId)
          throw new Error(
            '생성 응답의 인증 장소를 확인할 수 없습니다. 미션 목록을 새로고침해 주세요.'
          );
        setRecoverEvent(String(result.eventId));
        try {
          await mutation.mutateAsync({
            path: `/admin/zone-events/${result.eventId}/targets/${target.targetId}/replace`,
            method: 'POST',
            body: {
              ...(isAdminRecord(body.authTarget) ? body.authTarget : {}),
              ...place,
              reason: '관광지 API 참조 연결',
            },
            key: `${requestIdentity.current.key}-place`,
          });
        } catch (cause) {
          throw new Error(
            `미션은 생성됐지만 관광지 연결이 실패했습니다. 중복 생성하지 말고 미션 ${result.eventId}의 선택 장소에서 긴급 교체로 연결해 주세요. ${cause instanceof Error ? cause.message : ''}`
          );
        }
      }
      onClose();
    } catch (cause) {
      setError(cause);
    } finally {
      locked.current = false;
    }
  }
  async function upload(file: File, key: string) {
    setUploading(true);
    setError(null);
    try {
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 2 * 1024 * 1024
      )
        throw new Error('JPG·PNG·WebP 이미지를 2MB 이하로 선택해 주세요.');
      const form = new FormData();
      form.append('file', file);
      const response = await eventAdminRequest('/files', { method: 'POST', body: form });
      if (!isAdminRecord(response) || typeof response.fileKey !== 'string')
        throw new Error('이미지 업로드 응답을 확인할 수 없습니다.');
      set(key, response.fileKey);
    } catch (cause) {
      setError(cause);
    } finally {
      setUploading(false);
    }
  }
  return (
    <Modal
      title={operation.label}
      close={() => {
        if (!mutation.isPending && !uploading) onClose();
      }}
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <p className="text-sm text-slate-600">
          {operation.description ??
            '저장하면 실제 서버에 반영됩니다. 입력 내용과 처리 대상을 확인해 주세요.'}
        </p>
        {operation.initial && (
          <p className="rounded-xl bg-slate-50 p-3 text-sm">
            대상:{' '}
            {display(
              operation.initial.title ??
                operation.initial.name ??
                operation.initial.participationId ??
                operation.initial.payoutId ??
                operation.initial.titleName ??
                operation.initial.placeName
            )}
          </p>
        )}
        {operation.placePrefix !== undefined && (
          <TourPlaceSearch
            index={1}
            excludedIds={[]}
            select={(p) => {
              setPlace({
                placeContentId: p.contentId,
                contentTypeId: p.contentTypeId,
                placeName: p.title,
              });
              const prefix = operation.placePrefix ? `${operation.placePrefix}.` : '';
              setValues((v) => ({
                ...v,
                [`${prefix}latitude`]: String(p.latitude),
                [`${prefix}longitude`]: String(p.longitude),
              }));
            }}
          />
        )}
        {place && (
          <div className="rounded-xl bg-teal-50 p-3 text-sm">
            {String(place.placeName)} · {String(place.placeContentId)}
            <p>인증 좌표와 반경은 아래에서 조정할 수 있습니다.</p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) =>
            f.type === 'file' ? (
              <Field
                key={f.key}
                label={f.label}
              >
                <input
                  aria-label={f.label}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading || mutation.isPending}
                  onChange={(e) => {
                    if (e.target.files?.[0]) void upload(e.target.files[0], f.key);
                  }}
                />
                <p className="mt-1 break-all text-xs text-slate-500">
                  {values[f.key] ? '이미지 업로드 완료' : 'JPG·PNG·WebP, 최대 2MB'}
                </p>
              </Field>
            ) : (
              <FormField
                key={f.key}
                field={f}
                value={values[f.key] ?? f.value ?? ''}
                onChange={(v) => set(f.key, v)}
                disabled={mutation.isPending || !!recoverEvent}
              />
            )
          )}
        </div>
        {error !== null && <ErrorNotice error={error} />}
        <div className="flex justify-end gap-2">
          <Action
            type="button"
            disabled={mutation.isPending || uploading}
            onClick={onClose}
          >
            닫기
          </Action>
          <Action
            type="submit"
            disabled={mutation.isPending || uploading || !!recoverEvent}
          >
            {mutation.isPending ? '처리 중…' : uploading ? '업로드 중…' : operation.label}
          </Action>
        </div>
      </form>
    </Modal>
  );
}

function ReadPanel({
  path,
  title,
  onOperation,
  kind,
  parent,
}: {
  path: string;
  title: string;
  onOperation: (op: AdminOperation) => void;
  kind?: string;
  parent?: string;
}) {
  const query = useAdminRead(path);
  return (
    <Panel title={title}>
      {query.isPending ? (
        <p>불러오는 중…</p>
      ) : query.error ? (
        <>
          <ErrorNotice error={query.error} />
          <Action onClick={() => void query.refetch()}>다시 시도</Action>
        </>
      ) : (
        <>
          {query.data !== undefined && <Details value={query.data} />}
          {kind === 'targets' &&
            Array.isArray(query.data) &&
            query.data.filter(isAdminRecord).map((row) => (
              <div
                key={String(row.targetId)}
                className="mt-4 border-t pt-4"
              >
                <p className="mb-2 font-medium">
                  {String(row.placeName)} · {display(row.status)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {adminOperations('targets', row, parent).map((op) => (
                    <Action
                      key={op.label}
                      onClick={() => onOperation(op)}
                    >
                      {op.label}
                    </Action>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}
    </Panel>
  );
}

function RelatedList({ path, title }: { path: string; title: string }) {
  const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const query = useAdminPage(
    `${path}?page=${page}&size=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
  );
  const rows = query.data ?? null;
  return (
    <Panel title={title}>
      {query.error ? (
        <ErrorNotice error={query.error} />
      ) : query.isPending ? (
        <p>불러오는 중…</p>
      ) : (
        <>
          <Details value={rows?.items ?? []} />
          <div className="mt-4 flex gap-2">
            <Action
              disabled={page <= 1 || query.isFetching}
              onClick={() => {
                setPage((p) => p - 1);
                setCursor(history[history.length - 1] ?? '');
                setHistory((h) => h.slice(0, -1));
              }}
            >
              이전
            </Action>
            <span>{page} 페이지</span>
            <Action
              disabled={!rows || (!rows.hasNext && page >= rows.totalPages) || query.isFetching}
              onClick={() => {
                setHistory((h) => [...h, cursor]);
                setCursor(rows?.nextCursor ?? '');
                setPage((p) => p + 1);
              }}
            >
              다음
            </Action>
          </div>
        </>
      )}
    </Panel>
  );
}

function Winners({
  roundId,
  onOperation,
}: {
  roundId: string;
  onOperation: (op: AdminOperation) => void;
}) {
  const query = useAdminRead(`/admin/zone-event-rounds/${roundId}/top-n`);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const zones =
    isAdminRecord(query.data) && Array.isArray(query.data.zones)
      ? query.data.zones.filter(isAdminRecord)
      : [];
  return (
    <Panel title="Top N 수상자 선정">
      {query.error ? (
        <ErrorNotice error={query.error} />
      ) : query.isPending ? (
        <p>순위를 불러오는 중…</p>
      ) : (
        zones.map((zone) => {
          const candidates = Array.isArray(zone.candidates)
            ? zone.candidates.filter(isAdminRecord)
            : [];
          const event = String(zone.eventId);
          const ids = selected[event] ?? [];
          return (
            <section
              key={event}
              className="mb-5 rounded-xl border p-4"
            >
              <h3 className="font-semibold">{display(zone.zoneId)}</h3>
              <p className="text-sm text-slate-500">
                회차 마감 기준 좋아요입니다. 동점 후보를 검토하고 수상자를 선택하세요.
              </p>
              {candidates.map((c) => (
                <label
                  key={String(c.snapshotId)}
                  className="my-3 flex gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    disabled={c.heldByReport === true || c.finalized === true}
                    checked={ids.includes(String(c.participationId))}
                    onChange={(e) =>
                      setSelected((v) => ({
                        ...v,
                        [event]: e.target.checked
                          ? [...ids, String(c.participationId)]
                          : ids.filter((id) => id !== c.participationId),
                      }))
                    }
                  />
                  {display(c.rankN)}위 · 좋아요 {display(c.likeCountAtClose)} ·{' '}
                  {String(c.participationId)} {c.tied ? '(동점)' : ''}{' '}
                  {c.finalized ? '(확정됨)' : ''} {c.heldByReport ? '(신고 보류)' : ''}
                </label>
              ))}
              <Action
                disabled={!ids.length || !candidates.length}
                onClick={() =>
                  onOperation({
                    label: '수상자 확정',
                    path: `/admin/zone-events/${event}/winners/confirm`,
                    method: 'POST',
                    fields: [textField('selectionReason', '선정 근거', true)],
                    fixed: {
                      snapshotId: candidates[0].snapshotId,
                      expectedRevision: zone.version,
                      participationIds: ids,
                    },
                  })
                }
              >
                선택한 수상자 확정
              </Action>
            </section>
          );
        })
      )}
    </Panel>
  );
}

function ResourceDetail({
  resource,
  row,
  onClose,
  onOperation,
}: {
  resource: AdminResource;
  row: AdminRecord;
  onClose: () => void;
  onOperation: (op: AdminOperation) => void;
}) {
  const id = String(row[resource.id]);
  const path =
    resource.key === 'participations'
      ? `/admin/zone-event-reviews/${id}`
      : `${resource.path}/${id}`;
  const local = ['catalog', 'titles', 'stats', 'audits'].includes(resource.key);
  const query = useAdminRead(local ? null : path);
  const data = local ? row : isAdminRecord(query.data) ? query.data : null;
  return (
    <section className="space-y-5">
      <Action onClick={onClose}>← 목록으로</Action>
      <Panel title={`${resource.label} 상세`}>
        {!local && query.isPending ? (
          <p>불러오는 중…</p>
        ) : query.error ? (
          <>
            <ErrorNotice error={query.error} />
            <Action onClick={() => void query.refetch()}>다시 시도</Action>
          </>
        ) : (
          data && (
            <>
              <Details value={data} />
              <div className="mt-5 flex flex-wrap gap-2">
                {adminOperations(resource.key, data).map((op) => (
                  <Action
                    key={op.label}
                    onClick={() => onOperation(op)}
                  >
                    {op.label}
                  </Action>
                ))}
              </div>
            </>
          )
        )}
      </Panel>
      {resource.key === 'events' && (
        <ReadPanel
          title="선택 장소 · 원본 및 인증 좌표"
          path={`${path}/targets`}
          kind="targets"
          parent={`${path}/targets`}
          onOperation={onOperation}
        />
      )}
      {resource.key === 'rounds' && (
        <>
          <Winners
            roundId={id}
            onOperation={onOperation}
          />
          <ReadPanel
            title="정산 리포트"
            path={`${path}/settlement-report`}
            onOperation={onOperation}
          />
        </>
      )}
      {resource.key === 'catalog' && (
        <RelatedList
          title="상품 지급 이력"
          path={`${path}/grants`}
        />
      )}
      {resource.key === 'titles' && (
        <RelatedList
          title="칭호 보유자"
          path={`${path}/holders`}
        />
      )}
    </section>
  );
}

function ResourceList({
  resource,
  onOperation,
}: {
  resource: AdminResource;
  onOperation: (op: AdminOperation) => void;
}) {
  const [page, setPage] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState<AdminRecord | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const query = useAdminPage(`${resource.path}?page=${page}&size=20${filter}`);
  const result = query.data ?? null;
  const latestRow = result?.items.find((r) => r[resource.id] === detail?.[resource.id]);
  const selectRows = (result?.items ?? []).filter((r) => selected.includes(String(r.payoutId)));
  if (detail)
    return (
      <ResourceDetail
        resource={resource}
        row={latestRow ?? detail}
        onClose={() => setDetail(null)}
        onOperation={onOperation}
      />
    );
  return (
    <div className="space-y-5">
      <form
        className="grid gap-3 rounded-2xl border bg-white p-5 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          const params = new URLSearchParams();
          for (const field of resource.filters) {
            const v = values[field.key];
            if (v)
              params.set(
                field.key,
                field.type === 'datetime-local' ? new Date(`${v}:00+09:00`).toISOString() : v
              );
          }
          setFilter(`&${params}`);
          setPage(1);
          setSelected([]);
        }}
      >
        {resource.filters.map((field) => (
          <FormField
            key={field.key}
            field={field}
            value={values[field.key] ?? ''}
            onChange={(v) => setValues((s) => ({ ...s, [field.key]: v }))}
          />
        ))}
        <div className="flex items-end gap-2">
          <Action type="submit">조회</Action>
          <Action
            type="button"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            새로고침
          </Action>
        </div>
      </form>
      {resource.key === 'payouts' && (
        <div className="flex flex-wrap gap-2">
          {['bulk-confirm', 'bulk-schedule'].map((action) => (
            <Action
              key={action}
              disabled={!selectRows.length || query.isFetching}
              onClick={() =>
                onOperation({
                  label:
                    action === 'bulk-confirm' ? '선택 보상 일괄 확정' : '선택 보상 지급 일정 지정',
                  path: `/admin/reward-payouts/${action}`,
                  method: 'POST',
                  fields:
                    action === 'bulk-schedule'
                      ? [timeField('scheduledAt', '지급 예정 시각', true)]
                      : [],
                  fixed: {
                    payoutIds: selectRows.map((r) => r.payoutId),
                    expectedRevisions: Object.fromEntries(
                      selectRows.map((r) => [String(r.payoutId), r.revision])
                    ),
                  },
                  description:
                    '선택한 지급 건에 실제 반영됩니다. 기본 보상은 확정 시 서버 정책에 따라 포인트·배지가 지급될 수 있습니다.',
                })
              }
            >
              {action === 'bulk-confirm' ? '선택 보상 확정' : '지급 일정 지정'}
            </Action>
          ))}
        </div>
      )}
      {query.isPending ? (
        <p role="status">서버 데이터를 불러오는 중…</p>
      ) : query.error ? (
        <ErrorNotice error={query.error} />
      ) : (
        <Panel title={`${resource.label} · ${result?.totalElements ?? 0}건`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  {resource.key === 'payouts' && <th className="p-3">선택</th>}
                  {resource.columns.map((c) => (
                    <th
                      key={c}
                      className="whitespace-nowrap p-3 text-slate-500"
                    >
                      {adminLabels[c] ?? c}
                    </th>
                  ))}
                  <th className="p-3">상세</th>
                </tr>
              </thead>
              <tbody>
                {result?.items.map((row, index) => (
                  <tr
                    key={String(row[resource.id] ?? index)}
                    className="border-b last:border-0"
                  >
                    {resource.key === 'payouts' && (
                      <td className="p-3">
                        <input
                          aria-label={`${String(row.payoutId)} 선택`}
                          type="checkbox"
                          checked={selected.includes(String(row.payoutId))}
                          onChange={(e) =>
                            setSelected((s) =>
                              e.target.checked
                                ? [...s, String(row.payoutId)]
                                : s.filter((id) => id !== row.payoutId)
                            )
                          }
                        />
                      </td>
                    )}
                    {resource.columns.map((c) => (
                      <td
                        key={c}
                        className="max-w-56 break-words p-3"
                      >
                        {display(row[c])}
                      </td>
                    ))}
                    <td className="p-3">
                      <Action onClick={() => setDetail(row)}>상세</Action>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!result?.items.length && (
              <p className="p-8 text-center text-slate-500">조회된 데이터가 없습니다.</p>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <Action
              disabled={page <= 1 || query.isFetching}
              onClick={() => {
                setPage((p) => p - 1);
                setSelected([]);
              }}
            >
              이전
            </Action>
            <span>
              {page} / {Math.max(1, result?.totalPages ?? 1)}
            </span>
            <Action
              disabled={page >= (result?.totalPages ?? 1) || query.isFetching}
              onClick={() => {
                setPage((p) => p + 1);
                setSelected([]);
              }}
            >
              다음
            </Action>
          </div>
        </Panel>
      )}
    </div>
  );
}

export default function ServerEventAdmin() {
  const [section, setSection] = useState('rounds');
  const [operation, setOperation] = useState<AdminOperation | null>(null);
  const [suggest, setSuggest] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const client = useQueryClient();
  const previousToken = useRef(token);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (previousToken.current !== token) {
      client.removeQueries({ queryKey: ['event-admin-server'] });
      previousToken.current = token;
    }
  }, [token, client]);
  const resource = adminResources.find((r) => r.key === section)!;
  if (!hydrated) return <main className="p-8">로그인 정보를 확인하는 중…</main>;
  if (!token)
    return (
      <main className="mx-auto max-w-xl space-y-5 p-10">
        <h1 className="text-2xl font-bold">이벤트 관리자 로그인</h1>
        <p>ADMIN 또는 MANAGER 권한이 있는 계정으로 로그인해 주세요.</p>
        <Link
          href="/ko/auth/login"
          className="inline-block rounded-xl bg-teal-800 px-5 py-3 text-white"
        >
          로그인하러 가기
        </Link>
      </main>
    );
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="bg-teal-950 p-6 text-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0">
        <p className="text-xl font-bold">B-TING</p>
        <p className="mb-7 text-sm text-teal-200">구역 이벤트 운영</p>
        <nav
          aria-label="관리자 메뉴"
          className="flex flex-wrap gap-2 lg:flex-col"
        >
          {adminResources.map((r) => (
            <button
              key={r.key}
              className={`rounded-xl px-4 py-3 text-left text-sm ${section === r.key ? 'bg-white text-teal-950' : 'hover:bg-teal-900'}`}
              onClick={() => {
                setSection(r.key);
                setSuggest(false);
              }}
            >
              {r.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 space-y-6 p-5 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-teal-700">실제 서버 연동 · 한국 시간 기준</p>
            <h1 className="mt-2 text-3xl font-bold">{resource.label}</h1>
          </div>
          <div className="flex gap-2">
            {section === 'rounds' && (
              <Action onClick={() => setSuggest((s) => !s)}>구역 배정 제안</Action>
            )}
            {resource.create && (
              <Action onClick={() => setOperation(resource.create!)}>
                {resource.create.label}
              </Action>
            )}
          </div>
        </header>
        <p className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
          저장·승인·지급 확정은 실제 운영 데이터에 반영됩니다. 회차 시작·종료와 순위 집계는 서버
          기준으로 처리됩니다.
        </p>
        {suggest && (
          <ReadPanel
            title="구역 배정 제안"
            path="/admin/zone-event-rounds/suggest-slots?authSlots=4"
            onOperation={setOperation}
          />
        )}
        <ResourceList
          key={section}
          resource={resource}
          onOperation={setOperation}
        />
      </main>
      {operation && (
        <OperationForm
          key={JSON.stringify([operation.path, operation.label, operation.fixed])}
          operation={operation}
          onClose={() => setOperation(null)}
        />
      )}
    </div>
  );
}
