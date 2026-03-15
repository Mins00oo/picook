export type ConvertStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ShortsConvertRequest {
  url: string;
}

export interface ShortsConvertResponse {
  id: number;
  url: string;
  status: ConvertStatus;
  recipe: ShortsRecipe | null;
  errorMessage: string | null;
}

export interface ShortsRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: ShortsStep[];
}

export interface ShortsStep {
  stepNumber: number;
  description: string;
  type: 'ACTIVE' | 'WAIT';
  durationSeconds: number | null;
}

export interface ShortsHistory {
  id: number;
  url: string;
  title: string | null;
  status: ConvertStatus;
  createdAt: string;
}
