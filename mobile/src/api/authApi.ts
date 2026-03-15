import api from './client';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/user';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  loginApple: (identityToken: string) =>
    api.post<ApiResponse<AuthTokens>>('/api/auth/apple', { identityToken }),

  loginKakao: (accessToken: string) =>
    api.post<ApiResponse<AuthTokens>>('/api/auth/kakao', { accessToken }),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/api/auth/refresh',
      { refreshToken },
    ),

  logout: () => api.post<ApiResponse<null>>('/api/auth/logout'),

  deleteAccount: () => api.delete<ApiResponse<null>>('/api/v1/users/me'),
};
