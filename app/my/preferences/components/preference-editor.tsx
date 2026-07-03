'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PreferenceProgress } from '@/app/my/preferences/components/preference-progress';
import { PreferenceQuestion } from '@/app/my/preferences/components/preference-question';
import { PREFERENCE_QUESTIONS } from '@/app/my/preferences/questions';
import {
  travelSurveyQueryKey,
  useSaveTravelSurvey,
  useTravelSurvey,
} from '@/hooks/use-travel-survey';
import { getOnboardingErrorMessage } from '@/lib/onboarding-error-message';
import {
  createOnboardingProfile,
  EMPTY_ONBOARDING_ANSWERS,
  fromTravelSurveyResponse,
  toTravelSurveyRequest,
} from '@/lib/onboarding';
import { useAuthStore } from '@/stores/auth-store';
import type { AppLanguage, OnboardingAnswers, VisitPurpose } from '@/types/onboarding';

interface PreferenceEditorFormProps {
  initialAnswers: OnboardingAnswers;
  language: AppLanguage;
  loadFailed: boolean;
}

export function PreferenceEditor() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const survey = useTravelSurvey(Boolean(accessToken));

  if (!accessToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">로그인이 필요해요</h1>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-sky-700 px-6 font-semibold text-white"
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

  const profile = survey.data ? fromTravelSurveyResponse(survey.data) : null;

  return (
    <PreferenceEditorForm
      initialAnswers={profile ?? EMPTY_ONBOARDING_ANSWERS}
      language={profile?.language ?? 'ko'}
      loadFailed={survey.isError}
    />
  );
}

function PreferenceEditorForm({
  initialAnswers,
  language,
  loadFailed,
}: PreferenceEditorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const saveSurvey = useSaveTravelSurvey();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(() => ({
    ...initialAnswers,
    purposes: [...initialAnswers.purposes],
    skippedSteps: [...initialAnswers.skippedSteps],
  }));
  const [error, setError] = useState<string | null>(null);
  const question = PREFERENCE_QUESTIONS[step];
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

  const save = async (finalAnswers = answers) => {
    setError(null);

    try {
      const profile = createOnboardingProfile(
        finalAnswers,
        new Date().toISOString(),
        language,
      );
      const response = await saveSurvey.mutateAsync(toTravelSurveyRequest(profile));
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

  const skipCurrent = () => {
    const nextAnswers: OnboardingAnswers = {
      ...answers,
      [question.id]: question.id === 'purposes' ? [] : null,
      skippedSteps: Array.from(
        new Set([...answers.skippedSteps, step]),
      ).sort((a, b) => a - b),
    };
    setAnswers(nextAnswers);

    if (step === PREFERENCE_QUESTIONS.length - 1) {
      void save(nextAnswers);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col bg-white px-5 py-6 sm:min-h-[calc(100vh-4rem)] sm:rounded-3xl sm:px-10 sm:py-8 sm:shadow-sm">
        <PreferenceProgress
          current={step + 1}
          total={PREFERENCE_QUESTIONS.length}
          onBack={step > 0 ? () => setStep(step - 1) : undefined}
          onSkip={skipCurrent}
          onCancel={() => router.replace('/my')}
        />

        <div className="flex-1 py-10">
          <PreferenceQuestion
            question={question}
            value={value}
            onSelect={selectAnswer}
          />
        </div>

        {loadFailed ? (
          <p className="mb-3 text-center text-sm text-amber-700">
            기존 취향을 불러오지 못해 새로 설정합니다.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="mb-3 text-center text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={
            step === PREFERENCE_QUESTIONS.length - 1
              ? () => void save()
              : () => setStep(step + 1)
          }
          disabled={!canContinue || saveSurvey.isPending}
          className="min-h-14 w-full rounded-2xl bg-sky-700 px-5 text-base font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {saveSurvey.isPending
            ? '저장 중...'
            : step === PREFERENCE_QUESTIONS.length - 1
              ? '저장'
              : '다음'}
        </button>
      </div>
    </main>
  );
}
