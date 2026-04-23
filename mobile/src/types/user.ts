export type LoginType = 'APPLE' | 'KAKAO';
// v2.1 리뉴얼: 재료 기반(EGG/POTATO/CARROT) → 요리하는 사람 3종(MIN/ROO/HARU)
export type CharacterType = 'MIN' | 'ROO' | 'HARU';

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
  totalExp: number; // 누적 경험치 (v1.0 리뉴얼 이후 레벨 산정 기준)
  rank: RankInfo;
}

export interface UpdateProfileRequest {
  displayName?: string;
  characterType?: CharacterType;
}
