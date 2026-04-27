// --- Dashboard types (matching backend 3-endpoint API) ---

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalRecipes: number;
  totalShortsConversions: number;
  rankDistribution: Record<string, number>;
}

export interface RecipeRanking {
  id: number;
  title: string;
  viewCount: number;
}

export interface IngredientRanking {
  ingredientId: number;
  ingredientName: string;
  usageCount: number;
}

export interface DashboardRankings {
  topRecipesByViews: RecipeRanking[];
  topIngredientsByUsage: IngredientRanking[];
  recentFeedback: RecentFeedbackItem[];
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface DashboardCharts {
  userSignups: DailyCount[];
  shortsConversions: DailyCount[];
}

export interface DashboardData {
  summary: DashboardSummary;
  rankings: DashboardRankings;
  charts: DashboardCharts;
}

// --- Legacy sub-types still used by other pages ---

export interface RankingItem {
  id: number;
  name: string;
  count: number;
}

export interface RecentFeedbackItem {
  id: number;
  recipeName: string;
  userName: string;
  rating: string;
  comment?: string;
  createdAt: string;
}

export interface LevelDistItem {
  level: number;
  title: string;
  count: number;
}

export interface UserStatsData {
  totalUsers: number;
  activeUsers: number;
  signupTrend: { date: string; count: number }[];
  dau: number;
  mau: number;
  loginTypeDistribution: Record<string, number>;
}

export interface RecipeStatsData {
  categoryDistribution: Record<string, number>;
  popularRecipes: RecipeRanking[];
  totalRecipes: number;
}

export interface IngredientStatsData {
  popularIngredients: IngredientRanking[];
  unusedIngredients: IngredientRanking[];
}

export interface ShortsStatsPageData {
  totalConversions: number;
  totalCacheEntries: number;
  modelVersionDistribution: Record<string, number>;
}

export interface RankingStatsData {
  levelDistribution: Record<string, number>;
  averageLevel: number;
  totalCompletions: number;
  photoUploads: number;
  photoUploadRate: number;
}
