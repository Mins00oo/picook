import api from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { ShortsConvertResponse, ShortsHistory } from '../types/shorts';

export const shortsApi = {
  convert: (url: string) =>
    api.post<ApiResponse<ShortsConvertResponse>>('/api/v1/shorts/convert', { url }),

  getStatus: (id: number) =>
    api.get<ApiResponse<ShortsConvertResponse>>(`/api/v1/shorts/${id}`),

  getHistory: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<ShortsHistory>>>('/api/v1/shorts/history', {
      params: { page, size },
    }),
};
