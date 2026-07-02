'use client';

import { useEffect, useRef, useState } from 'react';
import { CircleAlert, LoaderCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useOAuthLogin } from '@/features/auth/hooks/use-oauth-login';
import {
  buildOAuthProviderToken,
  getOAuthRedirectUri,
  OAUTH_STORAGE_PREFIX,
} from '@/features/auth/lib/oauth';
import { useAuthStore } from '@/stores/auth-store';
import {
  getTravelSurvey,
  saveTravelSurvey,
} from '@/features/onboarding/api/travel-survey';
import { travelSurveyQueryKey } from '@/features/onboarding/hooks/use-travel-survey';
import { toTravelSurveyRequest } from '@/features/onboarding/model/onboarding';
import {
  clearPendingOnboardingCookie,
  getPendingOnboardingCookie,
} from '@/features/onboarding/lib/pending-onboarding-cookie';
import { useOnboardingStore } from '@/stores/onboarding-store';
import type { OAuthProvider } from '@/types/auth';

export function OAuthCallback({ provider }: { provider: OAuthProvider }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const login = useOAuthLogin();
  const setSession = useAuthStore((state) => state.setSession);
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const completeLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const returnedState = params.get('state');
      const providerError = params.get('error_description') ?? params.get('error');
      const stateKey = `${OAUTH_STORAGE_PREFIX}:${provider}:state`;
      const verifierKey = `${OAUTH_STORAGE_PREFIX}:${provider}:verifier`;
      const expectedState = sessionStorage.getItem(stateKey);
      const codeVerifier = sessionStorage.getItem(verifierKey);

      if (providerError) {
        setError(providerError);
        return;
      }

      if (!code || !returnedState || returnedState !== expectedState) {
        setError('로그인 요청 정보를 확인할 수 없습니다. 다시 시도해 주세요.');
        return;
      }

      if (!codeVerifier) {
        setError('로그인 세션이 만료되었습니다. 다시 시도해 주세요.');
        return;
      }

      try {
        const response = await login.mutateAsync({
          provider,
          providerToken: buildOAuthProviderToken(provider, code, returnedState),
          redirectUri: getOAuthRedirectUri(provider),
          codeVerifier,
        });

        setSession(response.data);
        sessionStorage.removeItem(stateKey);
        sessionStorage.removeItem(verifierKey);

        const pendingProfile =
          getPendingOnboardingCookie() ??
          useOnboardingStore.getState().pendingProfile;

        if (pendingProfile) {
          const existingSurvey = await getTravelSurvey();

          if (existingSurvey) {
            queryClient.setQueryData(travelSurveyQueryKey, existingSurvey);
          } else {
            const newSurvey = await saveTravelSurvey(
              toTravelSurveyRequest(pendingProfile),
            );
            queryClient.setQueryData(travelSurveyQueryKey, newSurvey);
          }

          clearPendingOnboardingCookie();
          useOnboardingStore.getState().setPendingProfile(null);
          router.replace('/');
          return;
        }

        const surveyResponse = await getTravelSurvey();

        if (!surveyResponse) {
          router.replace('/onboarding');
          return;
        }

        queryClient.setQueryData(travelSurveyQueryKey, surveyResponse);
        router.replace('/');
      } catch (loginError) {
        setError(
          loginError instanceof Error
            ? loginError.message
            : '로그인에 실패했습니다. 다시 시도해 주세요.',
        );
      }
    };

    void completeLogin();
  }, [login, provider, queryClient, router, setSession]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <CircleAlert className="mx-auto size-10 text-red-500" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-slate-950">
              로그인하지 못했어요
            </h1>
            <p role="alert" className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.replace('/auth/login')}
              className="mt-6 h-10 w-full rounded-xl bg-sky-800 text-sm font-semibold text-white hover:bg-sky-900"
            >
              로그인 화면으로 돌아가기
            </button>
          </>
        ) : (
          <>
            <LoaderCircle
              className="mx-auto size-10 animate-spin text-sky-700"
              aria-hidden="true"
            />
            <h1 className="mt-4 text-xl font-bold text-slate-950">
              로그인하고 있어요
            </h1>
            <p className="mt-2 text-sm text-slate-500">잠시만 기다려 주세요.</p>
          </>
        )}
      </div>
    </main>
  );
}
