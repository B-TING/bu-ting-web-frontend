'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, MapPinned, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { FeatureHighlight } from '@/features/onboarding/components/feature-highlight';
import { OnboardingHeader } from '@/features/onboarding/components/onboarding-header';
import { PreferenceQuestion } from '@/features/onboarding/components/preference-question';
import { ONBOARDING_QUESTIONS } from '@/features/onboarding/constants/onboarding';
import {
  travelSurveyQueryKey,
  useSaveTravelSurvey,
} from '@/features/onboarding/hooks/use-travel-survey';
import {
  createOnboardingProfile,
  fromTravelSurveyResponse,
  toTravelSurveyRequest,
} from '@/features/onboarding/model/onboarding';
import { setPendingOnboardingCookie } from '@/features/onboarding/lib/pending-onboarding-cookie';
import { getOnboardingErrorMessage } from '@/features/onboarding/lib/onboarding-error-message';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import type {
  OnboardingAnswers,
  OnboardingQuestionId,
  VisitPurpose,
} from '@/types/onboarding';

const TOTAL_STEPS = 13;

function getAnswerValue(
  answers: OnboardingAnswers,
  id: OnboardingQuestionId,
) {
  return answers[id];
}

function getSelectedFeatureCards(
  answers: OnboardingAnswers,
  featureIndex: number,
) {
  switch (featureIndex) {
    case 0:
      return [answers.travelStyle === 'spontaneous' ? 1 : 0];
    case 1:
      return [answers.schedulePace === 'packed' ? 1 : 0];
    case 2:
      return [answers.companions === 'solo' ? 1 : 0];
    case 3:
      return [answers.luggage === 'light' ? 1 : 0];
    case 4:
      return [
        ...(answers.purposes.includes('food') ? [0] : []),
        ...(answers.purposes.includes('culture') ? [1] : []),
      ];
    case 5:
      return [answers.busanFamiliarity === 'familiar' ? 1 : 0];
    default:
      return [];
  }
}

export function OnboardingFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    currentStep,
    language,
    answers,
    setCurrentStep,
    setAnswer,
    togglePurpose,
    unskipQuestion,
    skipQuestion,
    skipAll,
    setPendingProfile,
    resetDraft,
  } = useOnboardingStore();
  const saveSurvey = useSaveTravelSurvey();
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isComplete) return;

    const timeout = window.setTimeout(() => {
      router.replace(accessToken ? '/' : '/auth/login');
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [accessToken, isComplete, router]);

  const completeOnboarding = async (finalAnswers: OnboardingAnswers) => {
    setError(null);
    const localProfile = createOnboardingProfile(
      finalAnswers,
      new Date().toISOString(),
      language,
    );

    try {
      if (accessToken) {
        const response = await saveSurvey.mutateAsync(
          toTravelSurveyRequest(localProfile),
        );
        const serverProfile = fromTravelSurveyResponse(response);
        setPendingProfile(null);
        queryClient.setQueryData(travelSurveyQueryKey, response);
        void serverProfile;
      } else {
        setPendingProfile(localProfile);
        setPendingOnboardingCookie(localProfile);
      }

      resetDraft();
      setIsComplete(true);
    } catch (saveError) {
      setError(
        getOnboardingErrorMessage(
          saveError,
          '여행 취향을 저장하지 못했습니다.',
        ),
      );
    }
  };

  const isWelcome = currentStep === 0;
  const isQuestion = currentStep > 0 && currentStep % 2 === 1;
  const questionIndex = Math.floor((currentStep - 1) / 2);
  const featureIndex = Math.floor((currentStep - 2) / 2);
  const question = isQuestion ? ONBOARDING_QUESTIONS[questionIndex] : null;
  const questionValue = question
    ? getAnswerValue(answers, question.id)
    : null;
  const canContinue = question
    ? Array.isArray(questionValue)
      ? questionValue.length > 0
      : questionValue !== null
    : true;

  const handleAnswer = (value: string) => {
    if (!question) return;

    unskipQuestion(questionIndex);

    if (question.id === 'purposes') {
      togglePurpose(value as VisitPurpose);
      return;
    }

    setAnswer(question.id, value);
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) {
      void completeOnboarding(answers);
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    if (isWelcome) {
      skipAll();
      void completeOnboarding(useOnboardingStore.getState().answers);
      return;
    }

    if (question) {
      skipQuestion(questionIndex, question.id);

      if (currentStep >= TOTAL_STEPS - 2) {
        void completeOnboarding(useOnboardingStore.getState().answers);
      } else {
        setCurrentStep(currentStep + 2);
      }
      return;
    }

    handleNext();
  };

  const handleSkipAll = () => {
    skipAll();
    void completeOnboarding(useOnboardingStore.getState().answers);
  };

  if (isComplete) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-sky-100">
            <Sparkles className="size-8 text-sky-700" aria-hidden="true" />
          </span>
          <h1 className="mt-7 text-3xl font-bold text-slate-950">
            설문에 응답해 주셔서
            <br />감사합니다!
          </h1>
          <p className="mt-4 leading-7 text-slate-500">
            응답 정보는 필요한 여행 정보를 제공하는 데 이용됩니다.
          </p>
          <LoaderCircle
            className="mx-auto mt-10 size-6 animate-spin text-sky-600"
            aria-label="다음 화면으로 이동 중"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-0 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col bg-white px-5 py-6 sm:min-h-[calc(100vh-4rem)] sm:rounded-3xl sm:px-10 sm:py-8 sm:shadow-sm">
        <OnboardingHeader
          current={currentStep + 1}
          total={TOTAL_STEPS}
          onBack={currentStep > 0 ? () => setCurrentStep(currentStep - 1) : undefined}
          onSkip={handleSkip}
          secondaryLabel="온보딩 전체 건너뛰기"
          onSecondary={handleSkipAll}
        />

        <section className="flex-1 py-10">
          {isWelcome ? (
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-sky-700">
                WELCOME TO B-TING
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">
                환영합니다!
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-500">
                몇 가지 질문으로 나만의 부산 여행을 준비해 보세요. B-ting이
                취향에 맞는 기능과 여행 정보를 먼저 안내해 드릴게요.
              </p>

              <div className="mt-20 rounded-3xl bg-gradient-to-br from-sky-700 to-sky-950 p-8 text-white">
                <MapPinned className="size-10 text-sky-200" aria-hidden="true" />
                <p className="mt-8 text-3xl font-bold tracking-tight">B-TING</p>
                <p className="mt-3 text-sm leading-6 text-sky-100/80">
                  원한다면 전체 건너뛰기를 눌러 바로 시작할 수도 있어요.
                </p>
              </div>
            </div>
          ) : question ? (
            <PreferenceQuestion
              question={question}
              value={questionValue}
              onChange={handleAnswer}
            />
          ) : (
            <FeatureHighlight
              featureIndex={featureIndex}
              selectedCards={getSelectedFeatureCards(answers, featureIndex)}
            />
          )}
        </section>

        {error ? (
          <p role="alert" className="mb-3 text-center text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue || saveSurvey.isPending}
          className="min-h-12 w-full rounded-2xl bg-sky-700 px-5 text-base font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {saveSurvey.isPending
            ? '저장 중...'
            : currentStep === TOTAL_STEPS - 1
              ? '시작하기'
              : '다음'}
        </button>
      </div>
    </main>
  );
}
