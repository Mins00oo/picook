export interface Level {
  level: number;
  title: string;
  emoji: string;
  minExp: number; // v1.0부터 EXP 누적 기준
}

// v1.0 리뉴얼: 레벨 기준 totalExp (요리+사진 인증 80 EXP/회, 출석 +10 EXP).
// 4티어로 축소 (이전 7레벨 → 브론즈/실버/골드/다이아).
// 백엔드의 outfit_unlock_level(1~7)과는 별개로 클라이언트 표시 단계만 4개로 통합.
export const LEVELS: Level[] = [
  { level: 1, title: '브론즈', emoji: '🥉', minExp:    0 },
  { level: 2, title: '실버',   emoji: '🥈', minExp:  480 },
  { level: 3, title: '골드',   emoji: '🥇', minExp: 1680 },
  { level: 4, title: '다이아', emoji: '💎', minExp: 4080 },
];

export function getLevelForExp(totalExp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalExp >= LEVELS[i].minExp) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(current: Level): Level | null {
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

/** 현 레벨 내 진행률 0~100 */
export function getLevelProgress(totalExp: number): number {
  const current = getLevelForExp(totalExp);
  const next = getNextLevel(current);
  if (!next) return 100;
  const range = next.minExp - current.minExp;
  const progress = totalExp - current.minExp;
  return Math.round((progress / range) * 100);
}

/** 마이페이지 XP 행 — "120 / 200 EXP" 형식에 쓰는 상대값 쌍 */
export function getLevelExpSpan(totalExp: number): { current: number; span: number } {
  const curr = getLevelForExp(totalExp);
  const next = getNextLevel(curr);
  const span = next ? next.minExp - curr.minExp : 0;
  const current = totalExp - curr.minExp;
  return { current, span };
}

// ─────────────────────────────────────────────
// Deprecated (v0): 요리 횟수 기반. 호환용으로 남김.
// ─────────────────────────────────────────────
export function getLevelForCount(count: number): Level {
  return getLevelForExp(count * 80);
}
