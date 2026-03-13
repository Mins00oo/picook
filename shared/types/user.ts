// 사용자 관련 타입

export type LoginType = 'kakao' | 'apple';

export type CookingLevel = 'beginner' | 'easy' | 'intermediate' | 'advanced';

export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  profileImageUrl?: string;
  loginType: LoginType;
  cookingLevel: CookingLevel;
  coachingEnabled: boolean;
  coachingVoiceSpeed: number;
  completedCookingCount: number;
  isOnboarded: boolean;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  cookingLevel?: CookingLevel;
  coachingEnabled?: boolean;
  coachingVoiceSpeed?: number;
}

export interface OnboardingRequest {
  cookingLevel: CookingLevel;
  coachingEnabled: boolean;
  coachingVoiceSpeed: number;
}
