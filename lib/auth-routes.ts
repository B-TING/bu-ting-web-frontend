import { routing } from '@/i18n/routing';

/** 로그인 없이 접근 가능한 경로(locale 프리픽스 제외). 하위 경로도 함께 공개된다. */
export const PUBLIC_PATH_PREFIXES = ['/festivals', '/luggage', '/auth'];

function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/');
  const maybeLocale = segments[1];

  if ((routing.locales as readonly string[]).includes(maybeLocale)) {
    return `/${segments.slice(2).join('/')}` || '/';
  }

  return pathname;
}

export function isPublicPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);

  if (path === '/' || path === '') return true;

  return PUBLIC_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
