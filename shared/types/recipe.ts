// 레시피 관련 타입

export type RecipeCategory =
  | 'korean' | 'western' | 'chinese' | 'japanese'
  | 'snack' | 'dessert' | 'drink' | 'other';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type RecipeStatus = 'draft' | 'published' | 'hidden';

export type StepType = 'active' | 'wait';

export interface Recipe {
  id: number;
  title: string;
  category: RecipeCategory;
  difficulty: Difficulty;
  cookingTimeMinutes: number;
  servings: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  tips?: string;
  totalIngredients: number;
  viewCount: number;
  coachingReady: boolean;
  status: RecipeStatus;
}

export interface RecipeIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  amount?: number;
  unit?: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface RecipeStep {
  id: number;
  stepNumber: number;
  description: string;
  imageUrl?: string;
  stepType: StepType;
  durationSeconds: number;
  canParallel: boolean;
}

export interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  isFavorite?: boolean;
}

export interface RecommendRequest {
  ingredientIds: number[];
  maxTime?: number;
  difficulty?: Difficulty;
  servings?: number;
}

export interface RecommendResult {
  recipe: Recipe;
  matchRate: number;
  matchedCount: number;
  totalRequired: number;
  missingIngredients: string[];
}
