import api from './client';
import type { ApiResponse } from '../types/api';
import type {
  Recipe,
  RecommendRequest,
  RecipeSummary,
  CategoryCount,
  RecipePage,
} from '../types/recipe';

export type TimePeriod = 'breakfast' | 'lunch' | 'dinner' | 'midnight';

// 메인 카테고리 카드용 — 백엔드 코드: korean | western | japanese | other
export type RecipeCategory = 'korean' | 'western' | 'japanese' | 'other';

export const recipeApi = {
  recommend: (data: RecommendRequest) =>
    api.post<ApiResponse<RecipeSummary[]>>('/api/v1/recipes/recommend', data),

  getDetail: (id: number) =>
    api.get<ApiResponse<Recipe>>(`/api/v1/recipes/${id}`),

  recommendByTime: (period: TimePeriod) =>
    api.get<ApiResponse<RecipeSummary[]>>('/api/v1/recipes/recommend-by-time', {
      params: { period },
    }),

  // 메인의 카테고리 카드용 — 카테고리별 등록 건수
  categoryCounts: () =>
    api.get<ApiResponse<CategoryCount[]>>('/api/v1/recipes/category-counts'),

  // 메인의 저칼로리 섹션 — TOP N 가벼운 메뉴
  recommendLowCalorie: () =>
    api.get<ApiResponse<RecipeSummary[]>>('/api/v1/recipes/recommend-low-calorie'),

  // 카테고리 진입 후 페이징된 리스트
  byCategory: (category: RecipeCategory, page = 0, size = 20) =>
    api.get<ApiResponse<RecipePage>>('/api/v1/recipes', {
      params: { category, page, size },
    }),
};
