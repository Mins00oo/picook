import api from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { RecipeSummary } from '../types/recipe';

export const favoriteApi = {
  getList: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<RecipeSummary>>>('/api/v1/favorites', {
      params: { page, size },
    }),

  add: (recipeId: number) =>
    api.post<ApiResponse<null>>(`/api/v1/favorites/${recipeId}`),

  remove: (recipeId: number) =>
    api.delete<ApiResponse<null>>(`/api/v1/favorites/${recipeId}`),
};
