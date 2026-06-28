import { apiRequest } from '@/lib/api-client';
import type {
  ApiResponse,
  OAuthLoginData,
  OAuthLoginRequest,
} from '@/types/auth';

export function oauthLogin(request: OAuthLoginRequest) {
  return apiRequest<ApiResponse<OAuthLoginData>>('/api/v1/auth/oauth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
