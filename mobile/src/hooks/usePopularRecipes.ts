import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '../api/recipeApi';

export const popularRecipeKeys = {
  list: (limit: number) => ['recipes', 'popular', limit] as const,
};

/**
 * 인기 요리 — 요리북 인증 횟수 DESC 정렬.
 * 백엔드 API: GET /api/v1/recipes/popular?limit=N
 */
export function usePopularRecipes(limit = 30) {
  return useQuery({
    queryKey: popularRecipeKeys.list(limit),
    queryFn: async () => (await recipeApi.popular(limit)).data.data,
    staleTime: 1000 * 60 * 10,
  });
}
