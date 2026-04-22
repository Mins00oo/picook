import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fridgeApi, type FridgeIngredient } from '../api/fridgeApi';

export const fridgeKeys = {
  all: ['fridge'] as const,
  list: () => [...fridgeKeys.all, 'list'] as const,
};

export function useFridge() {
  const qc = useQueryClient();

  const query = useQuery<FridgeIngredient[]>({
    queryKey: fridgeKeys.list(),
    queryFn: async () => (await fridgeApi.list()).data.data,
    staleTime: 1000 * 60 * 5,
  });

  const add = useMutation({
    mutationFn: async (ingredientId: number) => (await fridgeApi.add(ingredientId)).data.data,
    onMutate: async (ingredientId) => {
      // 낙관적 업데이트 — 목록 즉시 반영 (placeholder로 addedAt=now)
      await qc.cancelQueries({ queryKey: fridgeKeys.list() });
      const prev = qc.getQueryData<FridgeIngredient[]>(fridgeKeys.list()) ?? [];
      const optimistic: FridgeIngredient = {
        id: -Date.now(), // 임시 음수 id (서버 id가 실제)
        ingredientId,
        ingredientName: '',
        categoryId: null,
        categoryName: null,
        addedAt: new Date().toISOString(),
      };
      qc.setQueryData<FridgeIngredient[]>(fridgeKeys.list(), [optimistic, ...prev]);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(fridgeKeys.list(), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fridgeKeys.list() });
    },
  });

  const remove = useMutation({
    mutationFn: async (ingredientId: number) => {
      await fridgeApi.remove(ingredientId);
      return ingredientId;
    },
    onMutate: async (ingredientId) => {
      await qc.cancelQueries({ queryKey: fridgeKeys.list() });
      const prev = qc.getQueryData<FridgeIngredient[]>(fridgeKeys.list()) ?? [];
      qc.setQueryData<FridgeIngredient[]>(
        fridgeKeys.list(),
        prev.filter((f) => f.ingredientId !== ingredientId),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(fridgeKeys.list(), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fridgeKeys.list() });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    add,
    remove,
    isMutating: add.isPending || remove.isPending,
  };
}
