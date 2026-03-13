import client from './client';
import type {
  UserStatsData,
  RecipeStatsData,
  IngredientStatsData,
  CoachingStatsData,
  ShortsStatsPageData,
  RankingStatsData,
} from '@/types/stats';

export function getUserStats(period?: string): Promise<UserStatsData> {
  return client.get('/admin/stats/users', { params: { period } }) as Promise<UserStatsData>;
}

export function getRecipeStats(): Promise<RecipeStatsData> {
  return client.get('/admin/stats/recipes') as Promise<RecipeStatsData>;
}

export function getIngredientStats(): Promise<IngredientStatsData> {
  return client.get('/admin/stats/ingredients') as Promise<IngredientStatsData>;
}

export function getCoachingStats(period?: string): Promise<CoachingStatsData> {
  return client.get('/admin/stats/coaching', { params: { period } }) as Promise<CoachingStatsData>;
}

export function getShortsStats(): Promise<ShortsStatsPageData> {
  return client.get('/admin/stats/shorts') as Promise<ShortsStatsPageData>;
}

export function getRankingStats(): Promise<RankingStatsData> {
  return client.get('/admin/stats/ranking') as Promise<RankingStatsData>;
}
