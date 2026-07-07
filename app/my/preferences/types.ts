import type { OnboardingQuestionId } from '@/types/onboarding';

export interface PreferenceOption {
  value: string;
  label: string;
}

export interface PreferenceQuestionData {
  id: OnboardingQuestionId;
  title: string;
  description: string;
  multiple?: boolean;
  options: PreferenceOption[];
}
