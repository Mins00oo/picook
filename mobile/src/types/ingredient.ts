export interface IngredientCategory {
  id: number;
  name: string;
  displayOrder: number;
}

export interface Ingredient {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  iconUrl: string | null;
  synonyms: string[];
}
