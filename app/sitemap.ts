import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

const PUBLIC_PATHS = ['', '/festivals', '/luggage'];

function localePath(locale: (typeof routing.locales)[number], path: string) {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefix}${path}` || '/';
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE_URL}${localePath(routing.defaultLocale, path)}`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${SITE_URL}${localePath(locale, path)}`])
      ),
    },
  }));
}
