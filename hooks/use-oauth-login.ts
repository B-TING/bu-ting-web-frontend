'use client';

import { useMutation } from '@tanstack/react-query';

import { oauthLogin } from '@/api/oauth-login';

export function useOAuthLogin() {
  return useMutation({ mutationFn: oauthLogin });
}
