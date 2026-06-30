export type AppLanguage = 'ko' | 'en' | 'ja' | 'zh';
export type TravelStyle = 'planned' | 'spontaneous';
export type SchedulePace = 'relaxed' | 'packed';
export type CompanionType = 'solo' | 'group';
export type LuggageLevel = 'light' | 'heavy';
export type VisitPurpose =
  | 'food'
  | 'scenery'
  | 'culture'
  | 'shopping'
  | 'nightlife'
  | 'relaxation';
export type BusanFamiliarity = 'novice' | 'familiar';

export interface OnboardingAnswers {
  travelStyle: TravelStyle | null;
  schedulePace: SchedulePace | null;
  companions: CompanionType | null;
  luggage: LuggageLevel | null;
  purposes: VisitPurpose[];
  busanFamiliarity: BusanFamiliarity | null;
  skippedSteps: number[];
  skippedAll: boolean;
}

export interface OnboardingProfile extends OnboardingAnswers {
  completedAt: string;
  language: AppLanguage;
  aiPromptContext: string;
}

export type OnboardingQuestionId =
  | 'travelStyle'
  | 'schedulePace'
  | 'companions'
  | 'luggage'
  | 'purposes'
  | 'busanFamiliarity';

export interface TravelSurveyRequest {
  preferredLanguage: AppLanguage;
  isPlanned: boolean | null;
  isRelaxed: boolean | null;
  isSolo: boolean | null;
  isLight: boolean | null;
  isFamiliar: boolean | null;
  purposes: VisitPurpose[];
  skippedSteps: number[];
  skippedAll: boolean;
}

export interface TravelSurveyResponse extends TravelSurveyRequest {
  completedAt: string | null;
  aiPromptContext: string | null;
}
