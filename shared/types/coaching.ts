// 코칭 관련 타입

export type CoachingMode = 'single' | 'multi';

export interface CoachingLog {
  id: number;
  userId: string;
  mode: CoachingMode;
  recipeIds: number[];
  estimatedSeconds?: number;
  actualSeconds?: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface StartCoachingRequest {
  mode: CoachingMode;
  recipeIds: number[];
}

export interface StartCoachingResponse {
  coachingLogId: number;
  recipes: import('./recipe').RecipeDetail[];
}

export interface CookingCompletion {
  id: number;
  userId: string;
  recipeId: number;
  coachingLogId: number;
  photoUrl: string;
  createdAt: string;
}
