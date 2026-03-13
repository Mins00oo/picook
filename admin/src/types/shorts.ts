export type {
  ShortsConvertResult,
  ShortsStep,
  ShortsIngredient,
  ShortsCacheItem,
} from '../../../shared/types/shorts';

export interface AdminShortsCacheListParams {
  keyword?: string;
  aiModelVersion?: string;
  page?: number;
  size?: number;
}

export interface ShortsStatsData {
  totalConversions: number;
  successRate: number;
  dailyTrend: { date: string; count: number; successCount: number }[];
  modelVersions: { version: string; count: number }[];
}
