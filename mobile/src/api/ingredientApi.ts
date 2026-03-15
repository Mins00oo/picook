import api from './client';
import type { ApiResponse } from '../types/api';
import type { Ingredient, IngredientCategory } from '../types/ingredient';

export const ingredientApi = {
  getCategories: () =>
    api.get<ApiResponse<IngredientCategory[]>>('/api/v1/ingredients/categories'),

  getAll: () =>
    api.get<ApiResponse<Ingredient[]>>('/api/v1/ingredients'),
};
