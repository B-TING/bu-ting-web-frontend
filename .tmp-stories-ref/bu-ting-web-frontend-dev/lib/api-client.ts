import type { ApiErrorResponse } from '@/types/auth';
import { getAuthorizationHeader, useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.buting.store'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
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

  const body = (await response.json()) as T | ApiErrorResponse;

  if (!response.ok) {
    if (response.status === 401 && usesStoredAuthorization) {
      useAuthStore.getState().clearSession();
    }

    const error = body as ApiErrorResponse;
    throw new ApiError(
      error.message || '요청을 처리하지 못했습니다.',
      response.status,
      error.data,
    );
  }

  return body as T;
}
