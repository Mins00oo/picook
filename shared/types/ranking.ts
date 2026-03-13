// 등급 관련 타입

export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  min: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: '요리 병아리', emoji: '🐣', min: 0 },
  { level: 2, title: '주방 탐험가', emoji: '🔍', min: 3 },
  { level: 3, title: '냉장고 파이터', emoji: '💪', min: 6 },
  { level: 4, title: '집밥 장인', emoji: '🍳', min: 11 },
  { level: 5, title: '요리 마스터', emoji: '👨‍🍳', min: 21 },
  { level: 6, title: '셀프 셰프', emoji: '⭐', min: 36 },
  { level: 7, title: '전설의 요리사', emoji: '🏆', min: 51 },
];

export interface UserRanking {
  completedCount: number;
  currentLevel: LevelInfo;
  nextLevel?: LevelInfo;
  progressToNext: number; // 0~1
}

export function getUserLevel(completedCount: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (completedCount >= LEVELS[i].min) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getUserRanking(completedCount: number): UserRanking {
  const currentLevel = getUserLevel(completedCount);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  const progressToNext = nextLevel
    ? (completedCount - currentLevel.min) / (nextLevel.min - currentLevel.min)
    : 1;

  return { completedCount, currentLevel, nextLevel, progressToNext };
}
