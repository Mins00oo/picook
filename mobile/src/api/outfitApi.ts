import api from './client';
import type { ApiResponse } from '../types/api';
import type { Outfit, OutfitMeResponse, OutfitSlot } from '../types/outfit';

export const outfitApi = {
  listCatalog: () =>
    api.get<ApiResponse<Outfit[]>>('/api/v1/outfits'),

  me: () =>
    api.get<ApiResponse<OutfitMeResponse>>('/api/v1/outfits/me'),

  purchase: (outfitId: number) =>
    api.post<ApiResponse<OutfitMeResponse>>('/api/v1/outfits/me/purchase', { outfitId }),

  equip: (slot: OutfitSlot, outfitId: number | null) =>
    api.put<ApiResponse<OutfitMeResponse>>('/api/v1/outfits/me/equip', { slot, outfitId }),
};
