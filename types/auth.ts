export type OAuthProvider = 'google' | 'naver' | 'kakao';

export interface OAuthLoginRequest {
  provider: OAuthProvider;
  providerToken: string;
  redirectUri?: string;
  codeVerifier?: string;
}

export interface OAuthLoginData {
  userId: string;
  email: string | null;
  nickname: string;
  provider: OAuthProvider;
  loggedIn: boolean;
  emailRequired: boolean;
  accessToken: string;
  tokenType: string;
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
