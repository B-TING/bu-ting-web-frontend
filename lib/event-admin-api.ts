import type { AdminJson, AdminRecord, AdminPage, AdminField } from '../types/event-admin-api';

export function isAdminRecord(value: unknown): value is AdminRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isAdminJson)
  );
}
export function isAdminJson(value: unknown): value is AdminJson {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    (Array.isArray(value) ? value.every(isAdminJson) : isAdminRecord(value))
  );
}
export function adminData(value: unknown): AdminJson {
  if (!isAdminJson(value)) throw new Error('서버 응답 형식이 올바르지 않습니다.');
  if (isAdminRecord(value) && 'success' in value) {
    if (value.success !== true)
      throw new Error(typeof value.message === 'string' ? value.message : '요청이 실패했습니다.');
    return value.data ?? null;
  }
  return value;
}
export function adminRows(value: AdminJson): AdminPage {
  if (Array.isArray(value))
    return {
      items: value.filter(isAdminRecord),
      page: 1,
      totalPages: 1,
      totalElements: value.length,
    };
  if (!isAdminRecord(value)) throw new Error('목록 응답을 읽을 수 없습니다.');
  const rows = value.items ?? value.slots ?? value.zones;
  if (!Array.isArray(rows)) return { items: [value], page: 1, totalPages: 1, totalElements: 1 };
  return {
    items: rows.filter(isAdminRecord),
    page: Number(value.page ?? 1),
    totalPages: Number(value.totalPages ?? 1),
    totalElements: Number(value.totalElements ?? rows.length),
    nextCursor: typeof value.nextCursor === 'string' ? value.nextCursor : null,
    hasNext: value.hasNext === true,
  };
}
export function adminGet(record: AdminRecord, path: string): AdminJson {
  let current: AdminJson = record;
  for (const part of path.split('.'))
    current = isAdminRecord(current) ? (current[part] ?? null) : null;
  return current;
}
export function adminSet(record: AdminRecord, path: string, value: AdminJson) {
  const parts = path.split('.');
  const last = parts.pop()!;
  let current = record;
  for (const part of parts) {
    if (!isAdminRecord(current[part])) current[part] = {};
    current = current[part] as AdminRecord;
  }
  current[last] = value;
}
export function adminBody(
  fields: AdminField[],
  values: Record<string, string>,
  fixed: AdminRecord = {}
): AdminRecord {
  const result: AdminRecord = structuredClone(fixed);
  for (const field of fields) {
    const value = values[field.key] ?? field.value ?? '';
    if (!value.trim()) {
      if (field.required) throw new Error(`${field.label}을(를) 입력해 주세요.`);
      continue;
    }
    let parsed: AdminJson = value.trim();
    if (field.type === 'number') {
      parsed = Number(value);
      if (
        !Number.isFinite(parsed) ||
        (field.min !== undefined && parsed < field.min) ||
        (field.max !== undefined && parsed > field.max)
      )
        throw new Error(`${field.label} 범위를 확인해 주세요.`);
    }
    if (field.type === 'checkbox') parsed = value === 'true';
    if (field.type === 'datetime-local') {
      const time = new Date(`${value}:00+09:00`);
      if (!Number.isFinite(time.getTime())) throw new Error('시각을 확인해 주세요.');
      parsed = time.toISOString();
    }
    adminSet(result, field.key, parsed);
  }
  return result;
}
