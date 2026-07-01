'use client';

import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import { startOAuthLogin } from '@/features/auth/lib/oauth';
import type { OAuthProvider } from '@/types/auth';

const PROVIDERS: Array<{
  provider: OAuthProvider;
  label: string;
  symbol: string;
  className: string;
}> = [
  {
    provider: 'google',
    label: 'Google로 계속하기',
    symbol: 'G',
    className: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
  },
  {
    provider: 'naver',
    label: '네이버로 계속하기',
    symbol: 'N',
    className: 'border-[#03c75a] bg-[#03c75a] text-white hover:bg-[#02b351]',
  },
  {
    provider: 'kakao',
    label: '카카오로 계속하기',
    symbol: 'K',
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

  const handleLogin = async (provider: OAuthProvider) => {
    setError(null);
    setPendingProvider(provider);

    try {
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
      {PROVIDERS.map(({ provider, label, symbol, className }) => {
        const isPending = pendingProvider === provider;

        return (
          <button
            key={provider}
            type="button"
            onClick={() => handleLogin(provider)}
            disabled={pendingProvider !== null}
            className={`relative flex h-12 w-full items-center justify-center rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
          >
            <span className="absolute left-4 flex size-6 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-slate-800">
              {symbol}
            </span>
            {isPending ? (
              <LoaderCircle className="size-5 animate-spin" aria-label="이동 중" />
            ) : (
              label
            )}
          </button>
        );
      })}

      {error ? (
        <p role="alert" className="pt-1 text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
