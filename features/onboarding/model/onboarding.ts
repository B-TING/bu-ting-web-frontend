import type {
  AppLanguage,
  OnboardingAnswers,
  OnboardingProfile,
  TravelSurveyRequest,
  TravelSurveyResponse,
} from '@/types/onboarding';

export const EMPTY_ONBOARDING_ANSWERS: OnboardingAnswers = {
  travelStyle: null,
  schedulePace: null,
  companions: null,
  luggage: null,
  purposes: [],
  busanFamiliarity: null,
  skippedSteps: [],
  skippedAll: false,
};

export function buildUserPromptContext(profile: OnboardingProfile) {
  return [
    '[User profile for B-ting route agent]',
    `language=${profile.language}`,
    `travelStyle=${profile.travelStyle ?? 'skipped'}`,
    `schedulePace=${profile.schedulePace ?? 'skipped'}`,
    `companions=${profile.companions ?? 'skipped'}`,
    `luggage=${profile.luggage ?? 'skipped'}`,
    `purposes=${profile.purposes.join(',') || 'skipped'}`,
    `busanFamiliarity=${profile.busanFamiliarity ?? 'skipped'}`,
    `skippedSteps=${profile.skippedSteps.join(',')}`,
    `skippedAll=${profile.skippedAll}`,
  ].join('; ');
}

export function createOnboardingProfile(
  answers: OnboardingAnswers,
  completedAt = new Date().toISOString(),
  language: AppLanguage = 'ko',
): OnboardingProfile {
  const profile = {
    ...answers,
    language,
    completedAt,
    aiPromptContext: '',
  };

  return { ...profile, aiPromptContext: buildUserPromptContext(profile) };
}

export function toTravelSurveyRequest(
  profile: OnboardingProfile,
): TravelSurveyRequest {
  return {
    preferredLanguage: profile.language,
    isPlanned:
      profile.travelStyle === null ? null : profile.travelStyle === 'planned',
    isRelaxed:
      profile.schedulePace === null ? null : profile.schedulePace === 'relaxed',
    isSolo:
      profile.companions === null ? null : profile.companions === 'solo',
    isLight: profile.luggage === null ? null : profile.luggage === 'light',
    isFamiliar:
      profile.busanFamiliarity === null
        ? null
        : profile.busanFamiliarity === 'familiar',
    purposes: profile.purposes,
    skippedSteps: profile.skippedSteps,
    skippedAll: profile.skippedAll,
  };
}

export function fromTravelSurveyResponse(
  response: TravelSurveyResponse,
): OnboardingProfile {
  const profile = createOnboardingProfile(
    {
      travelStyle:
        response.isPlanned === null
          ? null
          : response.isPlanned
            ? 'planned'
            : 'spontaneous',
      schedulePace:
        response.isRelaxed === null
          ? null
          : response.isRelaxed
            ? 'relaxed'
            : 'packed',
      companions:
        response.isSolo === null ? null : response.isSolo ? 'solo' : 'group',
      luggage:
        response.isLight === null ? null : response.isLight ? 'light' : 'heavy',
      purposes: response.purposes,
      busanFamiliarity:
        response.isFamiliar === null
          ? null
          : response.isFamiliar
            ? 'familiar'
            : 'novice',
      skippedSteps: response.skippedSteps,
      skippedAll: response.skippedAll,
    },
    response.completedAt ?? new Date().toISOString(),
  );

  return {
    ...profile,
    language: response.preferredLanguage,
    aiPromptContext: response.aiPromptContext ?? profile.aiPromptContext,
  };
}
