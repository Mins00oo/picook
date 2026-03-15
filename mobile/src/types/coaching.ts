export type CoachingStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'WAITING' | 'COMPLETED';

export interface CoachingState {
  recipeId: number;
  currentStep: number;
  totalSteps: number;
  status: CoachingStatus;
  remainingSeconds: number | null;
  startedAt: string;
}

export interface CoachingLogRequest {
  recipeId: number;
  completedSteps: number;
  totalTimeSeconds: number;
  photoUrl?: string;
}

export interface CoachingLog {
  id: number;
  recipeId: number;
  recipeTitle: string;
  completedSteps: number;
  totalTimeSeconds: number;
  photoUrl: string | null;
  createdAt: string;
}
