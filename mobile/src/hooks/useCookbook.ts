import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cookbookApi, type CreateCookbookEntryInput } from '../api/cookbookApi';

export const cookbookKeys = {
  all: ['cookbook'] as const,
  list: () => [...cookbookKeys.all, 'list'] as const,
  detail: (id: number) => [...cookbookKeys.all, 'detail', id] as const,
};

export function useCookbookList() {
  return useInfiniteQuery({
    queryKey: cookbookKeys.list(),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      (await cookbookApi.list(pageParam as number, 20)).data.data,
    getNextPageParam: (last) => (last.last ? undefined : last.page + 1),
  });
}

export function useCookbookDetail(id: number | null | undefined) {
  return useQuery({
    queryKey: cookbookKeys.detail(id ?? 0),
    queryFn: async () => (await cookbookApi.getDetail(id!)).data.data,
    enabled: !!id && id > 0,
  });
}

export function useCreateCookbookEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCookbookEntryInput) =>
      (await cookbookApi.create(input)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cookbookKeys.all });
      qc.invalidateQueries({ queryKey: ['points'] });
      qc.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
