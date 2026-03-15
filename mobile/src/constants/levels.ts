export interface Level {
  level: number;
  title: string;
  emoji: string;
  min: number;
}

export const LEVELS: Level[] = [
  { level: 1, title: '요리 병아리', emoji: '🐣', min: 0 },
  { level: 2, title: '주방 탐험가', emoji: '🔍', min: 3 },
  { level: 3, title: '냉장고 파이터', emoji: '💪', min: 6 },
  { level: 4, title: '집밥 장인', emoji: '🍳', min: 11 },
  { level: 5, title: '요리 마스터', emoji: '👨‍🍳', min: 21 },
  { level: 6, title: '셀프 셰프', emoji: '⭐', min: 36 },
  { level: 7, title: '전설의 요리사', emoji: '🏆', min: 51 },
];

export function getLevelForCount(count: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (count >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(current: Level): Level | null {
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getLevelProgress(count: number): number {
  const current = getLevelForCount(count);
  const next = getNextLevel(current);
  if (!next) return 100;
  const range = next.min - current.min;
  const progress = count - current.min;
  return Math.round((progress / range) * 100);
}
