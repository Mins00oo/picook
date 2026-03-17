import api from './client';
import type { ApiResponse } from '../types/api';
import type { Recipe, RecommendRequest, RecipeSummary } from '../types/recipe';

export const recipeApi = {
  recommend: (data: RecommendRequest) =>
    api.post<ApiResponse<RecipeSummary[]>>('/api/v1/recipes/recommend', data),

  getDetail: (id: number) =>
    api.get<ApiResponse<Recipe>>(`/api/v1/recipes/${id}`),
};
