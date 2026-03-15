import api from './client';
import type { ApiResponse } from '../types/api';
import type { CoachingLog, CoachingLogRequest } from '../types/coaching';

export const coachingApi = {
  complete: (data: CoachingLogRequest) =>
    api.post<ApiResponse<CoachingLog>>('/api/v1/coaching/complete', data),

  uploadPhoto: (formData: FormData) =>
    api.post<ApiResponse<{ url: string }>>('/api/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
