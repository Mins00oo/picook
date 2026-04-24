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
  categoryEmoji?: string | null;
  subcategoryId?: number | null;
  subcategoryName?: string | null;
  subcategoryEmoji?: string | null;
  emoji?: string | null;
  resolvedEmoji?: string | null;
  iconUrl?: string | null;
  synonyms: string[];
  usedRecipeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminIngredientRequest {
  name: string;
  categoryId: number;
  subcategoryId?: number | null;
  emoji?: string;
  iconUrl?: string;
  synonyms?: string[];
}

export interface IngredientListFilters {
  categoryId?: number;
  subcategoryId?: number;
  keyword?: string;
  hasSubcategory?: boolean;
  hasEmoji?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminCategoryResponse {
  id: number;
  name: string;
  emoji?: string | null;
  sortOrder: number;
  ingredientCount: number;
  createdAt: string;
}

export interface AdminCategoryRequest {
  name: string;
  emoji?: string;
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

export interface IngredientStatsResponse {
  total: number;
  missingSubcategory: number;
  missingEmoji: number;
  missingSynonyms: number;
  unusedInRecipes: number;
  byCategory: Array<{ categoryId: number; categoryName: string; count: number }>;
  bySubcategory: Array<{
    subcategoryId: number;
    subcategoryName: string;
    categoryId: number;
    categoryName: string;
    count: number;
  }>;
  last30DaysAdded: Array<{ date: string; count: number }>;
}

export interface BulkDeleteRequest {
  ids: number[];
}

export interface BulkDeleteResponse {
  requested: number;
  deleted: number;
  skipped: number;
  skipReasons: Array<{ id: number; reason: string }>;
}

export interface BulkMoveRequest {
  ids: number[];
  targetCategoryId: number;
  targetSubcategoryId?: number | null;
}
