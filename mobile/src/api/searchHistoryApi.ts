import api from './client';
import type { ApiResponse } from '../types/api';

export interface SearchHistory {
  id: number;
  ingredientIds: number[];
  ingredientNames: string[];
  createdAt: string;
}

export const searchHistoryApi = {
  getRecent: (size = 5) =>
    api.get<ApiResponse<SearchHistory[]>>('/api/v1/search-history', {
      params: { size },
    }),
};
