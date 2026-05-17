import { useQuery } from '@tanstack/react-query';
import { recipeApi, type TimePeriod } from '../api/recipeApi';

export const timeRecipeKeys = {
  all: ['recipes', 'by-time'] as const,
  period: (p: TimePeriod, limit?: number, seed?: string) =>
    [...timeRecipeKeys.all, p, limit ?? 'default', seed ?? 'no-seed'] as const,
};

export function useTimeRecipes(period: TimePeriod, limit?: number, seed?: string) {
  return useQuery({
    queryKey: timeRecipeKeys.period(period, limit, seed),
    queryFn: async () => (await recipeApi.recommendByTime(period, limit, seed)).data.data,
    staleTime: 1000 * 60 * 15, // 시간대는 몇 분 사이에 바뀌지 않음
  });
}
