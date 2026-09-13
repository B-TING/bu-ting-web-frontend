import type { Metadata } from 'next';
import { Geist_Mono, Noto_Sans_KR } from 'next/font/google';
import { Toaster } from 'sonner';

import { AuthHydrator } from '@/components/common/auth-hydrator';
import { AuthRouteGuard } from '@/components/common/auth-route-guard';
import { QueryProvider } from '@/components/common/query-provider';
import { routing } from '@/i18n/routing';

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

export const metadata: Metadata = {
  title: 'B-ting | 부산 여행 플래너',
  description: '취향에 맞는 부산 여행을 계획해 보세요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={routing.defaultLocale}
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
