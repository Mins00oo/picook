import api from './client';
import type { ApiResponse } from '../types/api';
import type { ShortsConvertResponse, ShortsHistory } from '../types/shorts';

export const shortsApi = {
  convert: (youtubeUrl: string) =>
    api.post<ApiResponse<ShortsConvertResponse>>('/api/v1/shorts/convert', { youtubeUrl }, {
      timeout: 120000, // 변환 파이프라인(yt-dlp+Whisper+GPT) 최대 2분
    }),

  getDetail: (cacheId: number) =>
    api.get<ApiResponse<ShortsConvertResponse>>(`/api/v1/shorts/${cacheId}`),

  getRecent: () =>
    api.get<ApiResponse<ShortsHistory[]>>('/api/v1/shorts/recent'),

  deleteHistory: (historyId: number) =>
    api.delete<ApiResponse<void>>(`/api/v1/shorts/history/${historyId}`),

  deleteAllHistory: () =>
    api.delete<ApiResponse<void>>('/api/v1/shorts/history'),
};
