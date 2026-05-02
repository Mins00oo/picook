export interface IngredientCategory {
  id: number;
  name: string;
  sortOrder: number;
  emoji?: string | null;
}

export interface Ingredient {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryEmoji?: string | null;
  subcategoryId?: number | null;
  subcategoryName?: string | null;
  subcategoryEmoji?: string | null;
  emoji?: string | null;          // 재료 고유
  resolvedEmoji?: string | null;  // 서버 폴백 적용된 최종값
  iconUrl: string | null;
  synonyms: string[];
}
