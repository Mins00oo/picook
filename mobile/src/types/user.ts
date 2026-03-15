export type CookingLevel = 'BEGINNER' | 'EASY' | 'INTERMEDIATE' | 'ADVANCED';
export type AuthProvider = 'APPLE' | 'KAKAO';

export interface User {
  id: number;
  nickname: string;
  email: string | null;
  profileImageUrl: string | null;
  cookingLevel: CookingLevel | null;
  coachingEnabled: boolean;
  coachingSpeed: number;
  completedCount: number;
  provider: AuthProvider;
  createdAt: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
  cookingLevel?: CookingLevel;
  coachingEnabled?: boolean;
  coachingSpeed?: number;
}

export interface OnboardingSetupRequest {
  cookingLevel: CookingLevel;
  coachingEnabled: boolean;
  coachingSpeed: number;
}
