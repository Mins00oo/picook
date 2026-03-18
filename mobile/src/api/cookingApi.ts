import api from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type {
  PhotoUploadResponse,
  CookingHistoryItem,
  CookingHistoryDetail,
  CookingStats,
} from '../types/cooking';

export const cookingApi = {
  /** 다중 사진 업로드 (최대 5장) */
  uploadPhotos: (coachingLogId: number, formData: FormData) =>
    api.post<ApiResponse<PhotoUploadResponse>>(
      `/api/v1/coaching/${coachingLogId}/photos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ),

  /** 사진 삭제 */
  deletePhoto: (photoId: number) =>
    api.delete<ApiResponse<null>>(`/api/v1/coaching/photos/${photoId}`),

  /** 요리 기록 목록 (페이지네이션) */
  getHistory: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<CookingHistoryItem>>>('/api/v1/cooking/history', {
      params: { page, size },
    }),

  /** 요리 기록 상세 */
  getHistoryDetail: (id: number) =>
    api.get<ApiResponse<CookingHistoryDetail>>(`/api/v1/cooking/history/${id}`),

  /** 요리 통계 */
  getStats: () =>
    api.get<ApiResponse<CookingStats>>('/api/v1/cooking/stats'),
};
