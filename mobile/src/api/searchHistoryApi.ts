import api from './client';
import type { ApiResponse } from '../types/api';

export interface SearchHistory {
  id: number;
  ingredientIds: number[];
  filters: string | null;
  resultCount: number;
  createdAt: string;
}

export const searchHistoryApi = {
  getRecent: () =>
    api.get<ApiResponse<SearchHistory[]>>('/api/v1/search-history'),

  deleteAll: () =>
    api.delete<ApiResponse<null>>('/api/v1/search-history'),

  deleteOne: (id: number) =>
    api.delete<ApiResponse<null>>(`/api/v1/search-history/${id}`),
};
