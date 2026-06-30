'use client';

import { LoaderCircle, LogOut, MapPin, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useTravelSurvey } from '@/features/onboarding/hooks/use-travel-survey';
import { fromTravelSurveyResponse } from '@/features/onboarding/model/onboarding';
import { getOnboardingErrorMessage } from '@/features/onboarding/lib/onboarding-error-message';
import { useAuthStore } from '@/stores/auth-store';

const LABELS = {
  planned: '계획적인 편',
  spontaneous: '즉흥적인 편',
  relaxed: '여유롭게',
  packed: '빡빡하게',
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
} as const;

export function MyPreferences() {
  const router = useRouter();
  const { user, accessToken, clearSession } = useAuthStore();
  const survey = useTravelSurvey(Boolean(accessToken));

  if (!accessToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <UserRound className="mx-auto size-12 text-slate-300" />
          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            로그인이 필요해요
          </h1>
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

  const profile = survey.data
    ? fromTravelSurveyResponse(survey.data)
    : null;
  const preferenceRows: Array<{
    title: string;
    value: keyof typeof LABELS | null;
  }> = profile
    ? [
        { title: '여행 스타일', value: profile.travelStyle },
        { title: '일정 페이스', value: profile.schedulePace },
        { title: '동행', value: profile.companions },
        { title: '짐', value: profile.luggage },
        { title: '부산 숙련도', value: profile.busanFamiliarity },
      ]
    : [];

  const logout = () => {
    clearSession();
    router.replace('/auth/login');
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-sky-950">
            <MapPin className="size-5 text-sky-700" /> B-TING
          </Link>
          <UserRound className="size-5 text-slate-500" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-950">마이페이지</h1>

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">내 계정</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">닉네임</dt>
              <dd className="mt-1 font-semibold text-slate-800">
                {user?.nickname || 'B-ting 여행자'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">이메일</dt>
              <dd className="mt-1 break-all font-semibold text-slate-800">
                {user?.email || '이메일 정보 없음'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">로그인 방식</dt>
              <dd className="mt-1 font-semibold capitalize text-slate-800">
                {user?.provider}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">사용자 ID</dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-600">
                {user?.userId}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">여행 취향</h2>
          <p className="mt-1 text-sm text-slate-500">
            AI 추천과 일정 생성에 반영되는 설문 응답입니다.
          </p>

          {survey.isLoading ? (
            <LoaderCircle className="mx-auto my-12 size-7 animate-spin text-sky-700" />
          ) : survey.isError ? (
            <p className="my-10 text-center text-sm leading-6 text-red-600">
              {getOnboardingErrorMessage(
                survey.error,
                '여행 취향을 불러오지 못했습니다.',
              )}
            </p>
          ) : profile ? (
            <dl className="mt-6 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
              {preferenceRows.map(({ title, value }) => (
                <div key={title}>
                  <dt className="text-slate-400">{title}</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {value ? LABELS[value] : '응답하지 않음'}
                  </dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-slate-400">관심사</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {profile.purposes.length > 0 ? (
                    profile.purposes.map((purpose) => (
                      <span
                        key={purpose}
                        className="rounded-full bg-sky-50 px-3 py-1.5 font-semibold text-sky-800"
                      >
                        {LABELS[purpose]}
                      </span>
                    ))
                  ) : (
                    <span className="font-semibold text-slate-800">
                      응답하지 않음
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="my-10 text-center text-sm text-slate-500">
              저장된 여행 취향이 없습니다.
            </p>
          )}

          <Link
            href="/my/preferences"
            className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-sky-700 font-bold text-white hover:bg-sky-800"
          >
            취향 다시 설정
          </Link>
        </section>

        <button
          type="button"
          onClick={logout}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="size-4" /> 로그아웃
        </button>
      </div>
    </main>
  );
}
