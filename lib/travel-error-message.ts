import { ApiError } from '@/lib/api-client';

export function getTravelCreateErrorMessage(
  error: unknown,
  fallback = '여행을 생성하지 못했습니다.'
) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
    }

    if (error.status === 400) {
      return '입력한 여행 날짜 또는 정보를 확인해 주세요.';
    }

    if (error.status >= 500) {
      return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }

  if (error instanceof TypeError) {
    return '서버와 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.';
  }

  return fallback;
}
