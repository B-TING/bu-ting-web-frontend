import type { OnboardingProfile } from '@/types/onboarding';

const COOKIE_NAME = 'buting_pending_onboarding';
const COOKIE_MAX_AGE = 60 * 60 * 24;

export function setPendingOnboardingCookie(profile: OnboardingProfile) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(profile),
  )}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getPendingOnboardingCookie(): OnboardingProfile | null {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    return JSON.parse(
      decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)),
    ) as OnboardingProfile;
  } catch {
    clearPendingOnboardingCookie();
    return null;
  }
}

export function clearPendingOnboardingCookie() {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
