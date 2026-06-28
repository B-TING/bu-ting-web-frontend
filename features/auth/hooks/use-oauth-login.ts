'use client';

import { useMutation } from '@tanstack/react-query';

import { oauthLogin } from '@/features/auth/api/oauth-login';

export function useOAuthLogin() {
  return useMutation({ mutationFn: oauthLogin });
}
