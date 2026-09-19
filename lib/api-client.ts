import type { ApiErrorResponse } from '@/types/auth';
import { getAuthorizationHeader, useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.buting.store').replace(
  /\/$/,
  ''
);

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const authorization = getAuthorizationHeader();
  const usesStoredAuthorization = authorization && !headers.has('Authorization');

  headers.set('Accept', 'application/json');

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (usesStoredAuthorization) {
    headers.set('Authorization', authorization);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  // 204 No Content 등 본문이 비어 있는 응답(예: DELETE)도 허용한다.
  const rawBody = await response.text();
  const body = (rawBody ? JSON.parse(rawBody) : null) as T | ApiErrorResponse | null;

  // 일부 엔드포인트는 실패 시에도 HTTP 200과 함께 { success: false, message }를 내려준다.
  const isEnvelopeFailure =
    !!body && typeof body === 'object' && 'success' in body && body.success === false;

  if (!response.ok || isEnvelopeFailure) {
    if (response.status === 401 && usesStoredAuthorization) {
      useAuthStore.getState().clearSession();
    }

    const error = (body ?? {}) as ApiErrorResponse;
    throw new ApiError(error.message || '요청을 처리하지 못했습니다.', response.status, error.data);
  }

  return body as T;
}
