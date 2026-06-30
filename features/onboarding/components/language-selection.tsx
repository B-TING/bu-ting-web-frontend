'use client';

import { Check, Languages, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useOnboardingStore } from '@/stores/onboarding-store';
import type { AppLanguage } from '@/types/onboarding';

const LANGUAGE_OPTIONS: Array<{
  value: AppLanguage;
  label: string;
  nativeLabel: string;
}> = [
  { value: 'ko', label: '한국어', nativeLabel: '한국어' },
  { value: 'en', label: '영어', nativeLabel: 'English' },
  { value: 'ja', label: '일본어', nativeLabel: '日本語' },
  { value: 'zh', label: '중국어', nativeLabel: '中文' },
];

export function LanguageSelection() {
  const router = useRouter();
  const language = useOnboardingStore((state) => state.language);
  const setLanguage = useOnboardingStore((state) => state.setLanguage);
  const resetDraft = useOnboardingStore((state) => state.resetDraft);

  const continueOnboarding = () => {
    resetDraft();
    router.push('/onboarding');
  };

  return (
    <main className="min-h-screen bg-slate-100 px-0 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col bg-white px-5 py-8 sm:min-h-[calc(100vh-4rem)] sm:rounded-3xl sm:px-10 sm:shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sky-950">
          <span className="flex size-10 items-center justify-center rounded-xl bg-sky-100">
            <MapPin className="size-5 text-sky-700" aria-hidden="true" />
          </span>
          B-TING
        </div>

        <section className="flex-1 py-14">
          <Languages className="size-10 text-sky-700" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            사용할 언어를 선택해 주세요
          </h1>
          <p className="mt-3 leading-7 text-slate-500">
            선택한 언어는 여행 안내와 추천에 사용됩니다.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {LANGUAGE_OPTIONS.map((option) => {
              const selected = language === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setLanguage(option.value)}
                  className={`flex min-h-20 items-center justify-between rounded-2xl border-2 px-5 text-left transition ${
                    selected
                      ? 'border-sky-600 bg-sky-50 text-sky-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200'
                  }`}
                >
                  <span>
                    <span className="block font-bold">{option.nativeLabel}</span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {option.label}
                    </span>
                  </span>
                  {selected ? (
                    <span className="flex size-7 items-center justify-center rounded-full bg-sky-600 text-white">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={continueOnboarding}
          className="min-h-12 w-full rounded-2xl bg-sky-700 font-bold text-white hover:bg-sky-800"
        >
          다음
        </button>
      </div>
    </main>
  );
}
