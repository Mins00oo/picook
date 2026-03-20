// --- Admin shorts types matching backend schemas ---

/** GET /api/admin/shorts/cache list item */
export interface ShortsCacheItem {
  id: number;
  youtubeUrl: string;
  title?: string;
  aiModelVersion: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/admin/shorts/cache/{id} detail */
export interface ShortsCacheDetail {
  id: number;
  youtubeUrl: string;
  urlHash: string;
  title?: string;
  aiModelVersion: string;
  thumbnailUrl?: string;
  /** JSON string containing the structured conversion result */
  result: string;
  createdAt: string;
  updatedAt: string;
}

/** Parsed shape of the `result` JSON field in ShortsCacheDetail */
export interface ShortsConvertResult {
  steps: ShortsStep[];
  ingredients: ShortsIngredient[];
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

/** GET /api/admin/shorts/stats */
export interface ShortsStatsData {
  totalCacheCount: number;
  totalConversionCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  failureRate: number;
}

export interface AdminShortsCacheListParams {
  keyword?: string;
  modelVersion?: string;
  page?: number;
  size?: number;
}
