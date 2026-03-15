export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type StepType = 'ACTIVE' | 'WAIT';

export interface RecipeStep {
  stepNumber: number;
  description: string;
  type: StepType;
  durationSeconds: number | null;
  imageUrl: string | null;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  cookTimeMinutes: number;
  difficulty: Difficulty;
  servings: number;
  matchRate?: number;
  isFavorite?: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface RecipeIngredient {
  ingredientId: number;
  name: string;
  amount: string;
  required: boolean;
  isOwned?: boolean;
}

export interface RecipeSummary {
  id: number;
  title: string;
  imageUrl: string | null;
  cookTimeMinutes: number;
  difficulty: Difficulty;
  servings: number;
  matchRate?: number;
  isFavorite?: boolean;
}

export interface RecommendRequest {
  ingredientIds: number[];
  maxCookTimeMinutes?: number;
  difficulty?: Difficulty;
  servings?: number;
}

export interface RecommendResponse {
  recipes: RecipeSummary[];
  totalCount: number;
}
