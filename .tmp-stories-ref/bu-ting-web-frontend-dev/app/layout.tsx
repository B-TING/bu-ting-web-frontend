import type { Metadata } from 'next';

import { AuthHydrator } from '@/components/common/auth-hydrator';
import { QueryProvider } from '@/components/common/query-provider';

import './globals.css';

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
    <QueryProvider>
      <AuthHydrator />
      {children}
    </QueryProvider>
  );
}
