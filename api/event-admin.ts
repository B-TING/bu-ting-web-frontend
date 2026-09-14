import { getAuthorizationHeader, useAuthStore } from '@/stores/auth-store';
import { ApiError } from '@/lib/api-client';
import { adminData, isAdminRecord } from '@/lib/event-admin-api';
import type { AdminJson, AdminRecord } from '@/types/event-admin-api';

const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.buting.store').replace(
  /\/$/,
  ''
);
/** Separate transport because the shared client assumes JSON bodies and cannot handle multipart/204. */
export async function eventAdminRequest(
  path: string,
  options: {
    method?: string;
    body?: AdminRecord | FormData;
    key?: string;
    signal?: AbortSignal;
  } = {}
): Promise<AdminJson> {
  const authorization = getAuthorizationHeader();
  if (!authorization) throw new ApiError('관리자 계정으로 로그인해 주세요.', 401);
  const headers = new Headers({ Accept: 'application/json', Authorization: authorization });
  if (options.key) headers.set('Idempotency-Key', options.key);
  const multipart = options.body instanceof FormData;
  if (options.body && !multipart) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${base}/api/v1${path}`, {
    method: options.method ?? 'GET',
    headers,
    signal: options.signal,
    body: multipart
      ? (options.body as FormData)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });
  const raw = await response.text();
  let result: unknown = null;
  try {
    result = raw ? JSON.parse(raw) : null;
  } catch {
    throw new ApiError('서버가 JSON 응답을 반환하지 않았습니다.', response.status);
  }
  if (!response.ok) {
    if (response.status === 401) useAuthStore.getState().clearSession();
    const message =
      response.status === 403
        ? 'ADMIN 또는 MANAGER 권한이 필요합니다.'
        : response.status === 409
          ? '다른 운영자가 변경했거나 현재 상태에서 처리할 수 없습니다. 새로고침 후 확인해 주세요.'
          : isAdminRecord(result) && typeof result.message === 'string'
            ? result.message
            : '서버 요청이 실패했습니다.';
    throw new ApiError(message, response.status, result);
  }
  return adminData(result);
}
