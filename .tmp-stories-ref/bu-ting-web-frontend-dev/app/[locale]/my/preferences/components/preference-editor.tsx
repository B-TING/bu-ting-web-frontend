'use client';

import { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { PreferenceQuestion } from '@/components/onboarding/preference-question';
import { ONBOARDING_QUESTIONS } from '@/constants/onboarding';
import {
  travelSurveyQueryKey,
  useSaveTravelSurvey,
  useTravelSurvey,
} from '@/hooks/use-travel-survey';
import {
  createOnboardingProfile,
  EMPTY_ONBOARDING_ANSWERS,
  fromTravelSurveyResponse,
  toTravelSurveyRequest,
} from '@/lib/onboarding';
import { getOnboardingErrorMessage } from '@/lib/onboarding-error-message';
import { useAuthStore } from '@/stores/auth-store';
import type {
  AppLanguage,
  OnboardingAnswers,
  VisitPurpose,
} from '@/types/onboarding';

export function PreferenceEditor() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const survey = useTravelSurvey(Boolean(accessToken));
  const saveSurvey = useSaveTravelSurvey();
  const initialized = useRef(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    EMPTY_ONBOARDING_ANSWERS,
  );
  const [language, setLanguage] = useState<AppLanguage>('ko');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!survey.data || initialized.current) return;
    initialized.current = true;
    const profile = fromTravelSurveyResponse(survey.data);
    setAnswers(profile);
    setLanguage(profile.language);
  }, [survey.data]);

  if (!accessToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-950">로그인이 필요해요</h1>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-sky-700 px-6 font-semibold text-white"
          >
            로그인하러 가기
          </Link>
        </div>
      </main>
    );
  }

  if (survey.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoaderCircle className="size-8 animate-spin text-sky-700" />
      </main>
    );
  }

  if (survey.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            여행 취향을 불러오지 못했어요
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {getOnboardingErrorMessage(survey.error)}
          </p>
          <button
            type="button"
            onClick={() => router.replace('/my')}
            className="mt-6 h-11 rounded-xl bg-sky-700 px-6 font-semibold text-white"
          >
            마이페이지로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  if (!survey.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            저장된 취향 정보가 없어요
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            먼저 사용자 온보딩을 완료하면 마이페이지에서 다시 수정할 수 있어요.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-sky-700 px-6 font-semibold text-white"
          >
            온보딩 하러 가기
          </Link>
        </div>
      </main>
    );
  }

  const question = ONBOARDING_QUESTIONS[step];
  const value = answers[question.id];
  const canContinue = Array.isArray(value) ? value.length > 0 : value !== null;

  const selectAnswer = (selectedValue: string) => {
    setAnswers((current) => {
      if (question.id === 'purposes') {
        const purpose = selectedValue as VisitPurpose;
        return {
          ...current,
          purposes: current.purposes.includes(purpose)
            ? current.purposes.filter((item) => item !== purpose)
            : [...current.purposes, purpose],
          skippedSteps: current.skippedSteps.filter((item) => item !== step),
          skippedAll: false,
        };
      }

      return {
        ...current,
        [question.id]: selectedValue,
        skippedSteps: current.skippedSteps.filter((item) => item !== step),
        skippedAll: false,
      };
    });
  };

  const skipCurrent = () => {
    setAnswers((current) => ({
      ...current,
      [question.id]: question.id === 'purposes' ? [] : null,
      skippedSteps: Array.from(new Set([...current.skippedSteps, step])).sort(
        (a, b) => a - b,
      ),
      skippedAll: false,
    }));

    if (step < ONBOARDING_QUESTIONS.length - 1) {
      setStep(step + 1);
    }
  };

  const save = async () => {
    setError(null);

    try {
      const profile = createOnboardingProfile(
        answers,
        new Date().toISOString(),
        language,
      );
      const response = await saveSurvey.mutateAsync(
        toTravelSurveyRequest(profile),
      );
      queryClient.setQueryData(travelSurveyQueryKey, response);
      router.replace('/my');
    } catch (saveError) {
      setError(
        getOnboardingErrorMessage(
          saveError,
          '여행 취향을 저장하지 못했습니다.',
        ),
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-0 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col bg-white px-5 py-6 sm:min-h-[calc(100vh-4rem)] sm:rounded-3xl sm:px-10 sm:py-8 sm:shadow-sm">
        <OnboardingHeader
          current={step + 1}
          total={ONBOARDING_QUESTIONS.length}
          onBack={step > 0 ? () => setStep(step - 1) : undefined}
          onSkip={skipCurrent}
          secondaryLabel="취소"
          onSecondary={() => router.replace('/my')}
        />

        <section className="flex-1 py-10">
          <PreferenceQuestion
            question={question}
            value={value}
            onChange={selectAnswer}
          />
        </section>

        {error ? (
          <p role="alert" className="mb-3 text-center text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={
            step === ONBOARDING_QUESTIONS.length - 1
              ? () => void save()
              : () => setStep(step + 1)
          }
          disabled={!canContinue || saveSurvey.isPending}
          className="min-h-12 w-full rounded-2xl bg-sky-700 px-5 text-base font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {saveSurvey.isPending
            ? '저장 중...'
            : step === ONBOARDING_QUESTIONS.length - 1
              ? '저장'
              : '다음'}
        </button>
      </div>
    </main>
  );
}
