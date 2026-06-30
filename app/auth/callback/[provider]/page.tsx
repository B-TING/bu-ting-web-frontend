import { notFound } from 'next/navigation';

import { OAuthCallback } from '@/features/auth/components/oauth-callback';
import type { OAuthProvider } from '@/types/auth';

const OAUTH_PROVIDERS: OAuthProvider[] = ['google', 'naver', 'kakao'];

export default async function OAuthCallbackPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;

  if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) {
    notFound();
  }

  return <OAuthCallback provider={provider as OAuthProvider} />;
}
