export type {
  LoginType,
  CookingLevel,
  UserStatus,
  UserProfile,
} from '../../../shared/types/user';

export interface AdminUserListItem {
  id: string;
  email?: string;
  displayName?: string;
  loginType: string;
  completedCookingCount: number;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminUserActivitySummary {
  coachingCount: number;
  completionCount: number;
  favoriteCount: number;
}

export interface AdminUserDetail {
  id: string;
  email?: string;
  displayName?: string;
  profileImageUrl?: string;
  loginType: string;
  cookingLevel: string;
  coachingEnabled: boolean;
  completedCookingCount: number;
  isOnboarded: boolean;
  status: string;
  suspendedReason?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  activitySummary: AdminUserActivitySummary;
}

export interface AdminCoachingLogItem {
  id: number;
  mode: string;
  recipeIds: number[];
  estimatedSeconds?: number;
  actualSeconds?: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface AdminCookingCompletionItem {
  id: number;
  recipeId: number;
  recipeName: string;
  photoUrl?: string;
  createdAt: string;
}

export interface AdminFavoriteItem {
  id: number;
  recipeId: number;
  recipeName: string;
  createdAt: string;
}

export interface AdminSearchHistoryItem {
  id: number;
  ingredientNames: string[];
  resultCount: number;
  createdAt: string;
}
