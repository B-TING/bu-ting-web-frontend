'use client';

import { useState, type FormEvent } from 'react';
import { LoaderCircle, LogOut, MapPin, Pencil, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useTravelSurvey } from '@/hooks/use-travel-survey';
import { getOnboardingErrorMessage } from '@/lib/onboarding-error-message';
import { fromTravelSurveyResponse } from '@/lib/onboarding';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import { useMyProfile, useUpdateMyProfile } from '../hooks/use-my-profile';

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

interface ProfileFormState {
  nickname: string;
  profileImageUrl: string;
  firstName: string;
  lastName: string;
}

const EMPTY_PROFILE_FORM: ProfileFormState = {
  nickname: '',
  profileImageUrl: '',
  firstName: '',
  lastName: '',
};

function getProfileErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return '로그인이 만료되었어요. 다시 로그인해 주세요.';
    }

    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export function MyPageContent() {
  const router = useRouter();
  const { user, accessToken, autoLoginEnabled, clearSession } = useAuthStore();
  const myProfile = useMyProfile(Boolean(accessToken));
  const updateProfile = useUpdateMyProfile();
  const survey = useTravelSurvey(Boolean(accessToken));
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_PROFILE_FORM);

  if (!accessToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <UserRound className="mx-auto size-12 text-slate-300" />
          <h1 className="mt-5 text-2xl font-bold text-slate-950">로그인이 필요해요</h1>
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

  const profile = myProfile.data;
  const onboardingProfile = survey.data
    ? fromTravelSurveyResponse(survey.data)
    : null;
  const preferenceRows: Array<{
    title: string;
    value: keyof typeof LABELS | null;
  }> = onboardingProfile
    ? [
        { title: '여행 스타일', value: onboardingProfile.travelStyle },
        { title: '일정 페이스', value: onboardingProfile.schedulePace },
        { title: '동행', value: onboardingProfile.companions },
        { title: '짐', value: onboardingProfile.luggage },
        { title: '부산 숙련도', value: onboardingProfile.busanFamiliarity },
      ]
    : [];

  const startEditing = () => {
    setForm({
      nickname: profile?.nickname ?? '',
      profileImageUrl: profile?.profileImageUrl ?? '',
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
    });
    updateProfile.reset();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    updateProfile.reset();
    setIsEditing(false);
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await updateProfile.mutateAsync({
        nickname: form.nickname.trim(),
        profileImageUrl: form.profileImageUrl.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      setIsEditing(false);
    } catch {
      // mutation의 오류 상태를 폼 안에서 표시합니다.
    }
  };

  const logout = () => {
    clearSession();
    router.replace('/auth/login');
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-sky-950">
            <MapPin className="size-5 text-sky-700" aria-hidden="true" />
            B-TING
          </Link>
          <UserRound className="size-5 text-slate-500" aria-hidden="true" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-950">마이페이지</h1>

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">내 계정</h2>
            {!isEditing && profile ? (
              <button
                type="button"
                onClick={startEditing}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
              >
                <Pencil className="size-4" aria-hidden="true" />
                수정
              </button>
            ) : null}
          </div>

          {myProfile.isLoading ? (
            <LoaderCircle className="mx-auto my-10 size-7 animate-spin text-sky-700" />
          ) : myProfile.isError ? (
            <div className="my-8 text-center">
              <p className="text-sm text-red-600">
                {getProfileErrorMessage(
                  myProfile.error,
                  '회원 정보를 불러오지 못했어요.',
                )}
              </p>
              <button
                type="button"
                onClick={() => void myProfile.refetch()}
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                다시 시도
              </button>
            </div>
          ) : isEditing ? (
            <form className="mt-5 space-y-4" onSubmit={(event) => void submitProfile(event)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  닉네임
                  <input
                    value={form.nickname}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, nickname: event.target.value }))
                    }
                    maxLength={50}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-600"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  프로필 이미지 URL
                  <input
                    type="url"
                    value={form.profileImageUrl}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        profileImageUrl: event.target.value,
                      }))
                    }
                    maxLength={500}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-600"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  성
                  <input
                    value={form.lastName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, lastName: event.target.value }))
                    }
                    maxLength={20}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-600"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  이름
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, firstName: event.target.value }))
                    }
                    maxLength={50}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-600"
                  />
                </label>
              </div>

              {updateProfile.isError ? (
                <p className="text-sm text-red-600">
                  {getProfileErrorMessage(
                    updateProfile.error,
                    '회원 정보를 수정하지 못했어요.',
                  )}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={updateProfile.isPending}
                  className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="h-10 rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {updateProfile.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          ) : (
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">닉네임</dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {profile?.nickname || user?.nickname || 'B-TING 여행자'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">이메일</dt>
                <dd className="mt-1 break-all font-semibold text-slate-800">
                  {profile?.email || user?.email || '이메일 정보 없음'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">로그인 방식</dt>
                <dd className="mt-1 font-semibold capitalize text-slate-800">
                  {profile?.provider || user?.provider || '알 수 없음'}
                </dd>
              </div>
              {(profile?.lastName || profile?.firstName) ? (
                <div>
                  <dt className="text-slate-400">이름</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {[profile.lastName, profile.firstName].filter(Boolean).join(' ')}
                  </dd>
                </div>
              ) : null}
            </dl>
          )}
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">로그인 세션</h2>
          <div className="mt-5 text-sm">
            <p className="text-slate-400">자동 로그인</p>
            <p className="mt-1 font-semibold text-slate-800">
              {autoLoginEnabled ? '켜짐' : '꺼짐'}
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">여행 취향</h2>
          <p className="mt-1 text-sm text-slate-500">
            AI 추천과 일정 생성에 반영되는 설문 응답이에요.
          </p>

          {survey.isLoading ? (
            <LoaderCircle className="mx-auto my-12 size-7 animate-spin text-sky-700" />
          ) : survey.isError ? (
            <p className="my-10 text-center text-sm leading-6 text-red-600">
              {getOnboardingErrorMessage(
                survey.error,
                '여행 취향을 불러오지 못했어요.',
              )}
            </p>
          ) : onboardingProfile ? (
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
                  {onboardingProfile.purposes.length > 0 ? (
                    onboardingProfile.purposes.map((purpose) => (
                      <span
                        key={purpose}
                        className="rounded-full bg-sky-50 px-3 py-1.5 font-semibold text-sky-800"
                      >
                        {LABELS[purpose]}
                      </span>
                    ))
                  ) : (
                    <span className="font-semibold text-slate-800">응답하지 않음</span>
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="my-10 text-center text-sm text-slate-500">
              저장된 여행 취향이 없어요.
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
          <LogOut className="size-4" aria-hidden="true" />
          로그아웃
        </button>
      </div>
    </main>
  );
}
