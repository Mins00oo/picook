export interface ShortsConvertResponse {
  cacheId: number;
  youtubeUrl: string;
  title: string;
  thumbnailUrl: string | null;
  channelName: string | null;
  originalTitle: string | null;
  durationSeconds: number | null;
  recipe: ShortsRecipe | null;
  fromCache: boolean;
  convertedAt: string;
}

export interface ShortsRecipe {
  title: string;
  description: string;
  servings: number;
  estimatedTimeMinutes: number;
  ingredients: string[];
  steps: ShortsStep[];
}

export interface ShortsStep {
  stepNumber: number;
  instruction: string;
  type: 'ACTIVE' | 'WAIT';
  durationSeconds: number | null;
}

export interface ShortsHistory {
  cacheId: number;
  youtubeUrl: string;
  title: string | null;
  thumbnailUrl: string | null;
  channelName: string | null;
  convertedAt: string;
}
