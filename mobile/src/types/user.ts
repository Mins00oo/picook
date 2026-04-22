export type LoginType = 'APPLE' | 'KAKAO';
export type CharacterType = 'EGG' | 'POTATO' | 'CARROT';

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
  characterType: CharacterType | null;
  completedCookingCount: number;
  pointBalance: number;
  rank: RankInfo;
}

export interface UpdateProfileRequest {
  displayName?: string;
  characterType?: CharacterType;
}
