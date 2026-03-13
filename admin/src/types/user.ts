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
  cookingLevel: string;
  completedCookingCount: number;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
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
  status: string;
  lastLoginAt?: string;
  createdAt: string;
  coachingLogs: AdminCoachingLogItem[];
  cookingCompletions: AdminCookingCompletionItem[];
  favorites: AdminFavoriteItem[];
  searchHistory: AdminSearchHistoryItem[];
}

export interface AdminCoachingLogItem {
  id: number;
  recipeNames: string[];
  mode: string;
  actualSeconds?: number;
  completed: boolean;
  startedAt: string;
}

export interface AdminCookingCompletionItem {
  id: number;
  recipeName: string;
  photoUrl: string;
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
