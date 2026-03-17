export type CookingLevel = 'BEGINNER' | 'EASY' | 'INTERMEDIATE' | 'ADVANCED';
export type LoginType = 'APPLE' | 'KAKAO';

export interface RankInfo {
  level: number;
  title: string;
  emoji: string;
  nextLevelAt: number | null;
}

export interface User {
  id: string; // UUID
  displayName: string;
  email: string | null;
  profileImageUrl: string | null;
  loginType: LoginType;
  cookingLevel: CookingLevel | null;
  coachingEnabled: boolean;
  coachingVoiceSpeed: number;
  completedCookingCount: number;
  isOnboarded: boolean;
  rank: RankInfo;
}

export interface UpdateProfileRequest {
  displayName?: string;
  cookingLevel?: CookingLevel;
  coachingEnabled?: boolean;
  coachingVoiceSpeed?: number;
  isOnboarded?: boolean;
}

export interface OnboardingSetupRequest {
  cookingLevel: CookingLevel;
  coachingEnabled: boolean;
  coachingVoiceSpeed: number;
  isOnboarded: boolean;
}
