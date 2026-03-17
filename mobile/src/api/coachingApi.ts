import api from './client';
import type { ApiResponse } from '../types/api';
import type {
  StartCoachingRequest,
  CompleteCoachingRequest,
  CoachingLogResponse,
  CookingCompletionResponse,
} from '../types/coaching';

export const coachingApi = {
  start: (data: StartCoachingRequest) =>
    api.post<ApiResponse<CoachingLogResponse>>('/api/v1/coaching/start', data),

  complete: (id: number, data: CompleteCoachingRequest) =>
    api.patch<ApiResponse<CoachingLogResponse>>(`/api/v1/coaching/${id}/complete`, data),

  uploadPhoto: (coachingId: number, formData: FormData) =>
    api.post<ApiResponse<CookingCompletionResponse>>(
      `/api/v1/coaching/${coachingId}/photo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ),
};
