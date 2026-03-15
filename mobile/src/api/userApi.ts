import api from './client';
import type { ApiResponse } from '../types/api';
import type { User, UpdateProfileRequest } from '../types/user';

export const userApi = {
  getMe: () => api.get<ApiResponse<User>>('/api/v1/users/me'),

  updateMe: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<User>>('/api/v1/users/me', data),
};
