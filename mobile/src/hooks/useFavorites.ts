import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteApi, type FavoriteItem } from '../api/favoriteApi';

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: () => [...favoriteKeys.all, 'list'] as const,
};

export function useFavorites() {
  const qc = useQueryClient();

  const query = useQuery<FavoriteItem[]>({
    queryKey: favoriteKeys.list(),
    queryFn: async () => (await favoriteApi.getList()).data.data,
    staleTime: 1000 * 60,
  });

  const add = useMutation({
    mutationFn: async (recipeId: number) => (await favoriteApi.add(recipeId)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: favoriteKeys.all }),
  });

  const remove = useMutation({
    mutationFn: async (favoriteId: number) => favoriteApi.remove(favoriteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: favoriteKeys.all }),
  });

  return { data: query.data, isLoading: query.isLoading, add, remove };
}
