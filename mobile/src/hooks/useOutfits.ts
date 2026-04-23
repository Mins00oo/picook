import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { outfitApi } from '../api/outfitApi';
import type { EquippedSlotMap, Outfit, OutfitSlot } from '../types/outfit';
import type { EquippedOutfitImages } from '../components/brand/CharacterOutfit';

export const outfitKeys = {
  all: ['outfits'] as const,
  catalog: () => [...outfitKeys.all, 'catalog'] as const,
  me: () => [...outfitKeys.all, 'me'] as const,
};

export function useOutfitCatalog() {
  return useQuery({
    queryKey: outfitKeys.catalog(),
    queryFn: async () => (await outfitApi.listCatalog()).data.data,
    staleTime: 1000 * 60 * 10,
  });
}

export function useOutfitMe() {
  return useQuery({
    queryKey: outfitKeys.me(),
    queryFn: async () => (await outfitApi.me()).data.data,
    staleTime: 1000 * 60 * 2,
  });
}

export function useEquipMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slot, outfitId }: { slot: OutfitSlot; outfitId: number | null }) =>
      (await outfitApi.equip(slot, outfitId)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: outfitKeys.me() });
    },
  });
}

export function usePurchaseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (outfitId: number) => (await outfitApi.purchase(outfitId)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: outfitKeys.me() });
      qc.invalidateQueries({ queryKey: outfitKeys.catalog() });
      qc.invalidateQueries({ queryKey: ['points'] });
      qc.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

/**
 * equipped(slot -> outfitId)와 catalog(Outfit[])를 합쳐 CharacterOutfit 렌더용
 * { slot: { imageUrl } } 맵을 만든다.
 */
export function useEquippedImages(
  equipped: EquippedSlotMap | undefined,
  catalog: Outfit[] | undefined,
): EquippedOutfitImages {
  return useMemo(() => {
    if (!equipped || !catalog) return {};
    const byId = new Map<number, Outfit>();
    catalog.forEach((o) => byId.set(o.id, o));
    const out: EquippedOutfitImages = {};
    (Object.keys(equipped) as OutfitSlot[]).forEach((slot) => {
      const outfitId = equipped[slot];
      if (!outfitId) return;
      const outfit = byId.get(outfitId);
      if (outfit) out[slot] = { imageUrl: outfit.imageUrl };
    });
    return out;
  }, [equipped, catalog]);
}
