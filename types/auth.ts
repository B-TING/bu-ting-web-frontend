export type OAuthProvider = 'google' | 'naver' | 'kakao';

export interface GoogleOAuthAuthorizationCodeLoginRequest {
  provider: 'google';
  providerToken: string;
  redirectUri: string;
  codeVerifier: string;
}

export interface ProviderOAuthAuthorizationCodeLoginRequest {
  provider: Exclude<OAuthProvider, 'google'>;
  providerToken: string;
  redirectUri: string;
  codeVerifier?: never;
}

export interface OAuthIdTokenLoginRequest {
  provider: Exclude<OAuthProvider, 'naver'>;
  providerToken: string;
  redirectUri?: never;
  codeVerifier?: never;
}

export type OAuthLoginRequest =
  | GoogleOAuthAuthorizationCodeLoginRequest
  | ProviderOAuthAuthorizationCodeLoginRequest
  | OAuthIdTokenLoginRequest;

export interface OAuthLoginData {
  userId: string;
  email: string | null;
  nickname: string;
  provider: OAuthProvider;
  loggedIn: boolean;
  emailRequired: boolean;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data?: unknown;
}
