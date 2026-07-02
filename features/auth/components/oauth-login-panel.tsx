'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import { startOAuthLogin } from '@/features/auth/lib/oauth';
import { useAuthStore } from '@/stores/auth-store';
import type { OAuthProvider } from '@/types/auth';

const PROVIDERS: Array<{
  provider: OAuthProvider;
  label: string;
  iconSrc: string;
  iconAlt: string;
  className: string;
}> = [
  {
    provider: 'google',
    label: 'Google 계정으로 로그인',
    iconSrc: '/social-google.svg',
    iconAlt: 'Google',
    className: 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
  },
  {
    provider: 'naver',
    label: '네이버로 로그인',
    iconSrc: '/social-naver.svg',
    iconAlt: 'Naver',
    className: 'border-[#03c75a] bg-[#03c75a] text-white hover:bg-[#02b351]',
  },
  {
    provider: 'kakao',
    label: '카카오 로그인',
    iconSrc: '/social-kakao.svg',
    iconAlt: 'Kakao',
    className: 'border-[#fee500] bg-[#fee500] text-[#191919] hover:bg-[#f5dc00]',
  },
];

export function OAuthLoginPanel({
  mode,
}: {
  mode?: 'login' | 'signup';
}) {
  void mode;
  const autoLoginEnabled = useAuthStore((state) => state.autoLoginEnabled);
  const setAutoLoginEnabled = useAuthStore((state) => state.setAutoLoginEnabled);
  const [nextAutoLoginEnabled, setNextAutoLoginEnabled] =
    useState(autoLoginEnabled);
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (provider: OAuthProvider) => {
    setError(null);
    setPendingProvider(provider);
    setAutoLoginEnabled(nextAutoLoginEnabled);

    try {
      await startOAuthLogin(provider);
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
    <div className="space-y-4">
      <div className="space-y-3">
        {PROVIDERS.map(({ provider, label, iconSrc, iconAlt, className }) => {
          const isPending = pendingProvider === provider;

          return (
            <button
              key={provider}
              type="button"
              onClick={() => void handleLogin(provider)}
              disabled={pendingProvider !== null}
              className={`relative flex h-14 w-full items-center justify-center rounded-2xl border px-5 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            >
              <span className="absolute left-5 flex size-7 items-center justify-center">
                <Image
                  src={iconSrc}
                  alt={iconAlt}
                  width={24}
                  height={24}
                  className="size-6"
                />
              </span>
              {isPending ? (
                <LoaderCircle className="size-5 animate-spin" aria-label="이동 중" />
              ) : (
                label
              )}
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={nextAutoLoginEnabled}
          onChange={(event) => setNextAutoLoginEnabled(event.target.checked)}
          className="size-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
        />
        자동 로그인
      </label>

      {error ? (
        <p role="alert" className="pt-1 text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
