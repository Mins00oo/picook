export interface DashboardStats {
  totalUsers: number;
  todaySignups: number;
  dau: number;
  mau: number;
  totalRecipes: number;
  publishedRecipes: number;
  coachingUsageRate: number;
  totalShortsConversions: number;
  dailyTrend: DailyTrendItem[];
  popularRecipes: RankingItem[];
  popularIngredients: RankingItem[];
  popularCoaching: RankingItem[];
  recentFeedback: RecentFeedbackItem[];
  levelDistribution: LevelDistItem[];
}

export interface DailyTrendItem {
  date: string;
  signups: number;
  searches: number;
  coachingSessions: number;
  shortsConversions: number;
}

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
  signupTrend: { date: string; count: number }[];
  dau: number;
  mau: number;
  loginTypeDistribution: { type: string; count: number }[];
}

export interface RecipeStatsData {
  categoryDistribution: { category: string; count: number }[];
  popularRecipes: RankingItem[];
  coachingReadyRate: number;
  totalRecipes: number;
}

export interface IngredientStatsData {
  popularIngredients: RankingItem[];
  unusedIngredients: { id: number; name: string }[];
}

export interface CoachingStatsData {
  usageRate: number;
  completionRate: number;
  hourlyDistribution: { hour: number; count: number }[];
  dailyTrend: { date: string; count: number }[];
}

export interface ShortsStatsPageData {
  conversionTrend: { date: string; count: number; successCount: number }[];
  successRate: number;
  totalConversions: number;
}

export interface RankingStatsData {
  levelDistribution: LevelDistItem[];
  photoUploadRate: number;
}
