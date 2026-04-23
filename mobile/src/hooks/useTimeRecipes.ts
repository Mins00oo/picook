import { useQuery } from '@tanstack/react-query';
import { recipeApi, type TimePeriod } from '../api/recipeApi';

export const timeRecipeKeys = {
  all: ['recipes', 'by-time'] as const,
  period: (p: TimePeriod) => [...timeRecipeKeys.all, p] as const,
};

export function useTimeRecipes(period: TimePeriod) {
  return useQuery({
    queryKey: timeRecipeKeys.period(period),
    queryFn: async () => (await recipeApi.recommendByTime(period)).data.data,
    staleTime: 1000 * 60 * 15, // 시간대는 몇 분 사이에 바뀌지 않음
  });
}
