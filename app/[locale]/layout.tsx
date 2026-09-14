import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { LOCALE_SEO_COPY, OG_LOCALE_MAP, SITE_ALT_NAME, SITE_NAME, SITE_URL } from '@/lib/seo';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

function resolveLocale(locale: string) {
  return (routing.locales as readonly string[]).includes(locale)
    ? (locale as (typeof routing.locales)[number])
    : routing.defaultLocale;
}

function localePath(locale: (typeof routing.locales)[number]) {
  return locale === routing.defaultLocale ? '/' : `/${locale}`;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const copy = LOCALE_SEO_COPY[locale];

  return {
    title: { absolute: copy.title },
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: localePath(locale),
      languages: Object.fromEntries(routing.locales.map((loc) => [loc, localePath(loc)])),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: localePath(locale),
      siteName: SITE_NAME,
      locale: OG_LOCALE_MAP[locale],
      images: [{ url: '/logo.png' }],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: copy.title,
      description: copy.description,
      images: ['/logo.png'],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: SITE_ALT_NAME,
  url: SITE_URL,
};

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {children}
    </NextIntlClientProvider>
  );
}
