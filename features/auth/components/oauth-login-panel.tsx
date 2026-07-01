'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import { startOAuthLogin } from '@/features/auth/lib/oauth';
import {
  getSavedAutoLoginPreference,
  saveAutoLoginPreference,
  useAuthStore,
} from '@/stores/auth-store';
import type { OAuthProvider } from '@/types/auth';

function ProviderLogo({ provider }: { provider: OAuthProvider }) {
  const src =
    provider === 'google'
      ? '/social-google.svg'
      : provider === 'naver'
        ? '/social-naver.svg'
        : '/social-kakao.svg';

  const alt =
    provider === 'google'
      ? 'Google'
      : provider === 'naver'
        ? 'Naver'
        : 'Kakao';

  return <Image src={src} alt={alt} width={20} height={20} className="size-5" />;
}

const PROVIDERS: Array<{
  provider: OAuthProvider;
  label: string;
  className: string;
}> = [
  {
    provider: 'google',
    label: 'Google 계정으로 로그인',
    className: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
  },
  {
    provider: 'naver',
    label: '네이버로 로그인',
    className: 'border-[#03c75a] bg-[#03c75a] text-white hover:bg-[#02b351]',
  },
  {
    provider: 'kakao',
    label: '카카오 로그인',
    className: 'border-[#fee500] bg-[#fee500] text-[#191919] hover:bg-[#f5dc00]',
  },
];

export function OAuthLoginPanel({
  mode = 'login',
}: {
  mode?: 'login' | 'signup';
}) {
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const currentAutoLoginEnabled = useAuthStore(
    (state) => state.autoLoginEnabled,
  );
  const [nextAutoLoginEnabled, setNextAutoLoginEnabled] = useState(
    getSavedAutoLoginPreference(),
  );

  const handleLogin = async (provider: OAuthProvider) => {
    setError(null);
    setPendingProvider(provider);

    try {
      if (mode === 'login') {
        saveAutoLoginPreference(nextAutoLoginEnabled);
      }
      await startOAuthLogin(provider, mode);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : '로그인을 시작하지 못했습니다.',
      );
      setPendingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      {PROVIDERS.map(({ provider, label, className }) => {
        const isPending = pendingProvider === provider;

        return (
          <button
            key={provider}
            type="button"
            onClick={() => handleLogin(provider)}
            disabled={pendingProvider !== null}
            className={`relative flex h-12 w-full items-center justify-center rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
          >
            <span className="absolute left-4 flex size-6 items-center justify-center">
              <ProviderLogo provider={provider} />
            </span>
            {isPending ? (
              <LoaderCircle className="size-5 animate-spin" aria-label="이동 중" />
            ) : (
              label
            )}
          </button>
        );
      })}

      {mode === 'login' ? (
        <label className="mt-2 flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={nextAutoLoginEnabled}
            onChange={(event) => setNextAutoLoginEnabled(event.target.checked)}
            className="size-4 rounded border-slate-300"
          />
          자동 로그인
        </label>
      ) : null}

      {mode === 'login' && currentAutoLoginEnabled !== nextAutoLoginEnabled ? (
        <p className="text-xs text-slate-400">
          변경한 자동 로그인 설정은 다음 로그인부터 적용돼요.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="pt-1 text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
