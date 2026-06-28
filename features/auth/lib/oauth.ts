import type { OAuthProvider } from '@/types/auth';

const PROVIDER_CONFIG: Record<
  OAuthProvider,
  { authorizationUrl: string; clientId?: string; scope?: string }
> = {
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    scope: 'openid email profile',
  },
  naver: {
    authorizationUrl: 'https://nid.naver.com/oauth2.0/authorize',
    clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID,
  },
  kakao: {
    authorizationUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
  },
};

export const OAUTH_STORAGE_PREFIX = 'buting-oauth';

function toBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function createRandomValue(length = 64) {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function createCodeChallenge(verifier: string) {
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  );

  return toBase64Url(new Uint8Array(digest));
}

export function getOAuthRedirectUri(provider: OAuthProvider) {
  return `${window.location.origin}/auth/callback/${provider}`;
}

export async function startOAuthLogin(provider: OAuthProvider) {
  const config = PROVIDER_CONFIG[provider];

  if (!config.clientId) {
    throw new Error(`${provider} Client ID가 설정되지 않았습니다.`);
  }

  const state = createRandomValue(32);
  const codeVerifier = createRandomValue();
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const redirectUri = getOAuthRedirectUri(provider);

  sessionStorage.setItem(`${OAUTH_STORAGE_PREFIX}:${provider}:state`, state);
  sessionStorage.setItem(
    `${OAUTH_STORAGE_PREFIX}:${provider}:verifier`,
    codeVerifier,
  );

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  if (config.scope) {
    params.set('scope', config.scope);
  }

  window.location.assign(`${config.authorizationUrl}?${params.toString()}`);
}
