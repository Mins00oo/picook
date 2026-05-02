import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { recipeApi, type RecipeCategory } from '../api/recipeApi';

export const categoryRecipeKeys = {
  all: ['recipes', 'category'] as const,
  counts: () => ['recipes', 'category-counts'] as const,
  list: (category: RecipeCategory) =>
    [...categoryRecipeKeys.all, category] as const,
  lowCalorie: () => ['recipes', 'low-calorie'] as const,
};

export function useCategoryCounts() {
  return useQuery({
    queryKey: categoryRecipeKeys.counts(),
    queryFn: async () => (await recipeApi.categoryCounts()).data.data,
    staleTime: 1000 * 60 * 30,
  });
}

export function useLowCalorieRecipes() {
  return useQuery({
    queryKey: categoryRecipeKeys.lowCalorie(),
    queryFn: async () => (await recipeApi.recommendLowCalorie()).data.data,
    staleTime: 1000 * 60 * 15,
  });
}

export function useCategoryRecipes(category: RecipeCategory | null) {
  return useInfiniteQuery({
    queryKey: category ? categoryRecipeKeys.list(category) : ['noop'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      (await recipeApi.byCategory(category!, pageParam as number, 20)).data
        .data,
    getNextPageParam: (last) => (last.last ? undefined : last.page + 1),
    enabled: !!category,
  });
}
