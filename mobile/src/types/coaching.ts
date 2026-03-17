export type CoachingStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'WAITING' | 'COMPLETED';

export interface CoachingState {
  recipeId: number;
  currentStep: number;
  totalSteps: number;
  status: CoachingStatus;
  remainingSeconds: number | null;
  startedAt: string;
}

export interface StartCoachingRequest {
  mode: 'single' | 'multi';
  recipeIds: number[];
  estimatedSeconds?: number;
}

export interface CompleteCoachingRequest {
  actualSeconds: number;
}

export interface CoachingLogResponse {
  id: number;
  mode: string;
  recipeIds: number[];
  estimatedSeconds: number | null;
  actualSeconds: number | null;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
}

export interface CookingCompletionResponse {
  id: number;
  recipeId: number;
  coachingLogId: number;
  photoUrl: string | null;
  createdAt: string;
  rankInfo: import('./user').RankInfo;
}
