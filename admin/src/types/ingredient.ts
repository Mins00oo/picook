export type {
  IngredientCategory,
  Ingredient,
  IngredientWithCategory,
} from '../../../shared/types/ingredient';

export interface AdminIngredientResponse {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  iconUrl?: string;
  synonyms: string[];
  usedRecipeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminIngredientRequest {
  name: string;
  categoryId: number;
  iconUrl?: string;
  synonyms?: string[];
}

export interface AdminCategoryResponse {
  id: number;
  name: string;
  sortOrder: number;
  ingredientCount: number;
  createdAt: string;
}

export interface AdminCategoryRequest {
  name: string;
  sortOrder?: number;
}

export interface CategoryReorderRequest {
  orderedIds: number[];
}

export interface IngredientBulkUploadResponse {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; reason: string }[];
}
