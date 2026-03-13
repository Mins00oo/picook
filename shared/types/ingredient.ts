// 재료 관련 타입

export interface IngredientCategory {
  id: number;
  name: string;
  sortOrder: number;
}

export interface Ingredient {
  id: number;
  name: string;
  categoryId: number;
  iconUrl?: string;
  synonyms?: string[];
}

export interface IngredientWithCategory extends Ingredient {
  category: IngredientCategory;
}

export interface IngredientListResponse {
  categories: IngredientCategory[];
  ingredients: Ingredient[];
}
