import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Geist_Mono, Noto_Sans_KR } from 'next/font/google';
import { Toaster } from 'sonner';

import { AuthHydrator } from '@/components/common/auth-hydrator';
import { AuthRouteGuard } from '@/components/common/auth-route-guard';
import { QueryProvider } from '@/components/common/query-provider';
import { routing } from '@/i18n/routing';
import { LOCALE_SEO_COPY, SITE_NAME, SITE_URL } from '@/lib/seo';

import './globals.css';

const notoSansKr = Noto_Sans_KR({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const defaultCopy = LOCALE_SEO_COPY[routing.defaultLocale];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultCopy.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultCopy.description,
  keywords: defaultCopy.keywords,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${notoSansKr.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <AuthHydrator />
          <AuthRouteGuard />
          {children}
        </QueryProvider>
        <Toaster
          position="bottom-center"
          richColors
        />
      </body>
    </html>
  );
}
