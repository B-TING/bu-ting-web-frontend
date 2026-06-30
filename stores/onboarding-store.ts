'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EMPTY_ONBOARDING_ANSWERS } from '@/features/onboarding/model/onboarding';
import type {
  AppLanguage,
  OnboardingAnswers,
  OnboardingProfile,
  OnboardingQuestionId,
  VisitPurpose,
} from '@/types/onboarding';

interface OnboardingState {
  language: AppLanguage;
  currentStep: number;
  answers: OnboardingAnswers;
  pendingProfile: OnboardingProfile | null;
  setCurrentStep: (step: number) => void;
  setLanguage: (language: AppLanguage) => void;
  setAnswer: (id: OnboardingQuestionId, value: string | null) => void;
  togglePurpose: (purpose: VisitPurpose) => void;
  unskipQuestion: (questionIndex: number) => void;
  replaceAnswers: (answers: OnboardingAnswers) => void;
  skipQuestion: (questionIndex: number, id: OnboardingQuestionId) => void;
  skipAll: () => void;
  setPendingProfile: (profile: OnboardingProfile | null) => void;
  resetDraft: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      language: 'ko',
      currentStep: 0,
      answers: EMPTY_ONBOARDING_ANSWERS,
      pendingProfile: null,
      setCurrentStep: (currentStep) => set({ currentStep }),
      setLanguage: (language) => set({ language }),
      setAnswer: (id, value) =>
        set((state) => ({
          answers: { ...state.answers, [id]: value },
        })),
      togglePurpose: (purpose) =>
        set((state) => ({
          answers: {
            ...state.answers,
            purposes: state.answers.purposes.includes(purpose)
              ? state.answers.purposes.filter((item) => item !== purpose)
              : [...state.answers.purposes, purpose],
          },
        })),
      unskipQuestion: (questionIndex) =>
        set((state) => ({
          answers: {
            ...state.answers,
            skippedSteps: state.answers.skippedSteps.filter(
              (step) => step !== questionIndex,
            ),
            skippedAll: false,
          },
        })),
      replaceAnswers: (answers) => set({ answers }),
      skipQuestion: (questionIndex, id) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [id]: id === 'purposes' ? [] : null,
            skippedSteps: Array.from(
              new Set([...state.answers.skippedSteps, questionIndex]),
            ).sort((a, b) => a - b),
          },
        })),
      skipAll: () =>
        set({
          answers: {
            ...EMPTY_ONBOARDING_ANSWERS,
            skippedSteps: [0, 1, 2, 3, 4, 5],
            skippedAll: true,
          },
        }),
      setPendingProfile: (pendingProfile) => set({ pendingProfile }),
      resetDraft: () =>
        set({ currentStep: 0, answers: EMPTY_ONBOARDING_ANSWERS }),
    }),
    {
      name: 'buting-onboarding',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
