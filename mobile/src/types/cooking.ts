// ─── Photo ───
export interface CoachingPhoto {
  id: number;
  photoUrl: string;
  displayOrder: number;
}

export interface PhotoUploadResponse {
  photos: CoachingPhoto[];
  completedCookingCount: number;
  level: number;
  title: string;
  emoji: string;
}

// ─── History ───
export interface CookingHistoryItem {
  id: number;
  mode: string;
  title: string;
  thumbnailUrl: string | null;
  estimatedSeconds: number;
  actualSeconds: number;
  completedAt: string;
  photos: CoachingPhoto[];
  wasLevelUp: boolean;
}

export interface RecipeInfo {
  id: number;
  title: string;
  imageUrl: string | null;
}

export interface CookingHistoryDetail {
  id: number;
  mode: string;
  title: string;
  estimatedSeconds: number;
  actualSeconds: number;
  startedAt: string;
  completedAt: string;
  recipes: RecipeInfo[];
  photos: CoachingPhoto[];
}

// ─── Stats ───
export interface MonthlyCount {
  yearMonth: string; // "2026-03"
  count: number;
}

export interface CookingStats {
  totalCompleted: number;
  totalWithPhoto: number;
  totalPhotos: number;
  firstCookingDate: string | null;
  monthlyCount: MonthlyCount[];
  currentLevel: number;
  currentTitle: string;
  currentEmoji: string;
}
