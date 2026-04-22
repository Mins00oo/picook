import api from './client';
import type { ApiResponse } from '../types/api';

export interface FridgeIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  categoryId: number | null;
  categoryName: string | null;
  addedAt: string;
}

export const fridgeApi = {
  list: () =>
    api.get<ApiResponse<FridgeIngredient[]>>('/api/v1/fridge/ingredients'),

  add: (ingredientId: number) =>
    api.post<ApiResponse<FridgeIngredient>>(`/api/v1/fridge/ingredients/${ingredientId}`),

  remove: (ingredientId: number) =>
    api.delete<ApiResponse<null>>(`/api/v1/fridge/ingredients/${ingredientId}`),

  bulkSet: (ingredientIds: number[]) =>
    api.put<ApiResponse<FridgeIngredient[]>>('/api/v1/fridge/ingredients', { ingredientIds }),
};
