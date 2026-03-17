export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type StepType = 'ACTIVE' | 'WAIT';

export interface RecipeStep {
  id: number;
  stepNumber: number;
  description: string;
  stepType: string;
  durationSeconds: number;
  imageUrl: string | null;
  canParallel: boolean;
}

export interface RecipeIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  amount: number;
  unit: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface Recipe {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  cookingTimeMinutes: number;
  servings: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  tips: string | null;
  totalIngredients: number;
  viewCount: number;
  coachingReady: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  createdAt: string;
}

export interface MissingIngredient {
  id: number;
  name: string;
}

export interface RecipeSummary {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  cookingTimeMinutes: number;
  servings: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  matchingRate: number;
  missingIngredients: MissingIngredient[];
}

export interface RecommendRequest {
  ingredientIds: number[];
  maxTime?: number;
  difficulty?: Difficulty;
  servings?: number;
}

// Backend returns RecipeSummary[] directly (flat array), not wrapped
export type RecommendResponse = RecipeSummary[];
