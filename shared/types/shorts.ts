// 쇼츠 변환 관련 타입

export interface ShortsConvertRequest {
  youtubeUrl: string;
}

export interface ShortsConvertResult {
  id: number;
  youtubeUrl: string;
  title?: string;
  thumbnailUrl?: string;
  steps: ShortsStep[];
  ingredients: ShortsIngredient[];
  aiModelVersion: string;
  createdAt: string;
}

export interface ShortsStep {
  stepNumber: number;
  description: string;
  stepType: 'active' | 'wait';
  durationSeconds: number;
}

export interface ShortsIngredient {
  name: string;
  amount?: string;
  unit?: string;
}

export interface ShortsCacheItem {
  id: number;
  youtubeUrl: string;
  title?: string;
  thumbnailUrl?: string;
  aiModelVersion: string;
  stepCount: number;
  createdAt: string;
  updatedAt: string;
}
