import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

const PRIVATE_PATHS = [
  '/ai-helpdesk',
  '/my',
  '/onboarding',
  '/sos',
  '/stays',
  '/stories',
  '/trips',
];

export default function robots(): MetadataRoute.Robots {
  const localePrefixes = routing.locales.map((locale) =>
    locale === routing.defaultLocale ? '' : `/${locale}`
  );

  const disallow = localePrefixes.flatMap((prefix) =>
    PRIVATE_PATHS.map((path) => `${prefix}${path}`)
  );

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
