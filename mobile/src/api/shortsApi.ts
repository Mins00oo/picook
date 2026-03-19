import api from './client';
import type { ApiResponse } from '../types/api';
import type { ShortsConvertResponse, ShortsHistory, ShortsFavorite } from '../types/shorts';

export const shortsApi = {
  convert: (youtubeUrl: string) =>
    api.post<ApiResponse<ShortsConvertResponse>>('/api/v1/shorts/convert', { youtubeUrl }, {
      timeout: 120000, // 변환 파이프라인(yt-dlp+Whisper+GPT) 최대 2분
      _skipNetworkAlert: true, // 백그라운드 전환 시 스토어에서 직접 복구 처리
    } as any),

  getDetail: (cacheId: number) =>
    api.get<ApiResponse<ShortsConvertResponse>>(`/api/v1/shorts/${cacheId}`),

  getRecent: () =>
    api.get<ApiResponse<ShortsHistory[]>>('/api/v1/shorts/recent'),

  deleteHistory: (historyId: number) =>
    api.delete<ApiResponse<void>>(`/api/v1/shorts/history/${historyId}`),

  deleteAllHistory: () =>
    api.delete<ApiResponse<void>>('/api/v1/shorts/history'),

  // ─── 쇼츠 즐겨찾기 ───
  getFavorites: () =>
    api.get<ApiResponse<ShortsFavorite[]>>('/api/v1/shorts/favorites'),

  addFavorite: (shortsCacheId: number) =>
    api.post<ApiResponse<ShortsFavorite>>('/api/v1/shorts/favorites', { shortsCacheId }),

  removeFavorite: (favoriteId: number) =>
    api.delete<ApiResponse<void>>(`/api/v1/shorts/favorites/${favoriteId}`),
};
