'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AccountCard } from '@/app/my/components/account-card';
import { MyBottomNavigation } from '@/app/my/components/my-bottom-navigation';
import { MyHeader } from '@/app/my/components/my-header';
import { TravelPreferenceCard } from '@/app/my/components/travel-preference-card';
import type { PreferenceRow } from '@/app/my/types';
import { useTravelSurvey } from '@/hooks/use-travel-survey';
import { getOnboardingErrorMessage } from '@/lib/onboarding-error-message';
import { fromTravelSurveyResponse } from '@/lib/onboarding';
import { useAuthStore } from '@/stores/auth-store';
import type {
  BusanFamiliarity,
  CompanionType,
  LuggageLevel,
  SchedulePace,
  TravelStyle,
  VisitPurpose,
} from '@/types/onboarding';

const LABELS: Record<
  | TravelStyle
  | SchedulePace
  | CompanionType
  | LuggageLevel
  | VisitPurpose
  | BusanFamiliarity,
  string
> = {
  planned: '계획적인 편',
  spontaneous: '즉흥적인 편',
  relaxed: '여유롭게',
  packed: '빽빽하게',
  solo: '혼자 여행',
  group: '함께 여행',
  light: '가볍게',
  heavy: '많이 챙김',
  food: '음식',
  scenery: '풍경',
  culture: '문화체험',
  shopping: '쇼핑',
  nightlife: '나이트라이프',
  relaxation: '휴식',
  novice: '잘 모른다',
  familiar: '아는 편이다',
};

function getSingleLabel(value?: keyof typeof LABELS | null) {
  return value ? LABELS[value] : '응답하지 않음';
}

export function MyPageContent() {
  const router = useRouter();
  const {
    user,
    accessToken,
    hideUserId,
    clearSession,
    setHideUserId,
  } = useAuthStore();
  const survey = useTravelSurvey(Boolean(accessToken));
  const profile = survey.data ? fromTravelSurveyResponse(survey.data) : null;

  if (!accessToken || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
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

  const rows: PreferenceRow[] = profile
    ? [
        { label: '여행 스타일', value: getSingleLabel(profile.travelStyle) },
        { label: '일정 페이스', value: getSingleLabel(profile.schedulePace) },
        { label: '동행', value: getSingleLabel(profile.companions) },
        { label: '짐', value: getSingleLabel(profile.luggage) },
        {
          label: '관심사',
          value: profile.purposes.length
            ? profile.purposes.map((item) => LABELS[item]).join(', ')
            : '응답하지 않음',
        },
        {
          label: '부산 숙련도',
          value: getSingleLabel(profile.busanFamiliarity),
        },
      ]
    : [];

  const logout = () => {
    clearSession();
    router.replace('/auth/login');
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <MyHeader />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          마이페이지
        </h1>

        <div className="mt-7 space-y-5">
          <AccountCard user={user} hideUserId={hideUserId} />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">로그인 세션</h2>
            <div className="mt-5 text-sm">
              <p className="text-slate-400">자동 로그인</p>
              <p className="mt-1 font-semibold text-slate-800">꺼짐</p>
            </div>
            <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={hideUserId}
                onChange={(event) => setHideUserId(event.target.checked)}
                className="size-5 accent-sky-700"
              />
              사용자 ID 숨기기
            </label>
          </section>

          <TravelPreferenceCard
            rows={rows}
            isLoading={survey.isLoading}
            errorMessage={
              survey.isError
                ? getOnboardingErrorMessage(
                    survey.error,
                    '여행 취향을 불러오지 못했습니다.',
                  )
                : undefined
            }
          />

          <button
            type="button"
            onClick={logout}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 font-bold text-white hover:bg-sky-800"
          >
            <LogOut className="size-5" />
            로그아웃
          </button>
        </div>
      </div>
      <MyBottomNavigation />
    </main>
  );
}
