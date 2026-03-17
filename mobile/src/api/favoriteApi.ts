import api from './client';
import type { ApiResponse } from '../types/api';

export interface FavoriteItem {
  id: number; // favorite entity ID
  recipeId: number;
  recipeTitle: string;
  recipeThumbnailUrl: string | null;
  recipeCategory: string;
  recipeDifficulty: string;
  cookingTimeMinutes: number;
  createdAt: string;
}

export const favoriteApi = {
  getList: () =>
    api.get<ApiResponse<FavoriteItem[]>>('/api/v1/favorites'),

  add: (recipeId: number) =>
    api.post<ApiResponse<FavoriteItem>>('/api/v1/favorites', { recipeId }),

  remove: (favoriteId: number) =>
    api.delete<ApiResponse<null>>(`/api/v1/favorites/${favoriteId}`),
};
