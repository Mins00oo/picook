import api from './client';
import type { ApiResponse } from '../types/api';
import type { User, UpdateProfileRequest } from '../types/user';

export const userApi = {
  getMe: () => api.get<ApiResponse<User>>('/api/v1/users/me'),

  // 프로필 수정. 닉네임이 이미 사용 중이면 백엔드가
  // 409 CONFLICT + error.code = 'DISPLAY_NAME_TAKEN' 을 내려줌
  // (GlobalExceptionHandler.handleDataIntegrity, uq_users_display_name 제약).
  updateMe: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<User>>('/api/v1/users/me', data),
};
