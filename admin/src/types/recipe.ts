export type {
  RecipeCategory,
  Difficulty,
  RecipeStatus,
  Recipe,
  RecipeDetail,
  RecipeIngredient,
  RecipeStep,
} from '../../../shared/types/recipe';

export interface AdminRecipeListItem {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  cookingTimeMinutes: number;
  servings: number;
  thumbnailUrl?: string;
  totalIngredients: number;
  viewCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecipeDetail {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  cookingTimeMinutes: number;
  servings: number;
  calories?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  tips?: string;
  totalIngredients: number;
  viewCount: number;
  status: string;
  ingredients: AdminRecipeIngredientItem[];
  steps: AdminRecipeStepItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecipeIngredientItem {
  id?: number;
  ingredientId: number;
  ingredientName: string;
  amount?: number;
  unit?: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface AdminRecipeStepItem {
  id?: number;
  stepNumber: number;
  description: string;
  imageUrl?: string;
}

export interface AdminRecipeRequest {
  title: string;
  category: string;
  difficulty: string;
  cookingTimeMinutes: number;
  servings?: number;
  calories?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  tips?: string;
  ingredients: {
    ingredientId: number;
    amount?: number;
    unit?: string;
    isRequired?: boolean;
    sortOrder?: number;
  }[];
  steps: {
    stepNumber: number;
    description: string;
    imageUrl?: string;
  }[];
}

export interface RecipeBulkUploadResponse {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; reason: string }[];
}
