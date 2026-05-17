export type LoginType = 'APPLE' | 'KAKAO';
// HARU is kept as a legacy server value and falls back to MIN in the UI.
export type CharacterType = 'MIN' | 'ROO' | 'HARU';

export interface RankInfo {
  level: number;
  title: string;
  emoji: string;
  nextLevelAt: number | null;
}

export interface User {
  id: string; // UUID
  displayName: string | null;
  oauthName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  loginType: LoginType;
  characterType: CharacterType | null;
  completedCookingCount: number;
  pointBalance: number;
  totalExp: number;
  rank: RankInfo;
}

export interface UpdateProfileRequest {
  displayName?: string;
  characterType?: CharacterType;
}
