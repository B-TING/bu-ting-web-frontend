export type OAuthProvider = 'google' | 'naver' | 'kakao';

export interface OAuthAuthorizationCodeLoginRequest {
  provider: OAuthProvider;
  providerToken: string;
  redirectUri: string;
  codeVerifier: string;
}

export interface OAuthIdTokenLoginRequest {
  provider: Exclude<OAuthProvider, 'naver'>;
  providerToken: string;
  redirectUri?: never;
  codeVerifier?: never;
}

export type OAuthLoginRequest =
  | OAuthAuthorizationCodeLoginRequest
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
