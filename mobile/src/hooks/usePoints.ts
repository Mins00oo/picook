import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { pointApi } from '../api/pointApi';

export const pointKeys = {
  all: ['points'] as const,
  balance: () => [...pointKeys.all, 'balance'] as const,
  history: () => [...pointKeys.all, 'history'] as const,
};

export function usePointBalance(enabled = true) {
  return useQuery({
    queryKey: pointKeys.balance(),
    queryFn: async () => (await pointApi.balance()).data.data.balance,
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePointHistory() {
  return useInfiniteQuery({
    queryKey: pointKeys.history(),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      (await pointApi.history(pageParam as number, 20)).data.data,
    getNextPageParam: (last) => (last.last ? undefined : last.page + 1),
  });
}
