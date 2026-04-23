export interface Level {
  level: number;
  title: string;
  emoji: string;
  minExp: number; // v1.0부터 EXP 누적 기준
}

// v1.0 리뉴얼: 레벨 기준을 completedCookingCount → totalExp 로 전환.
// 환산 규칙: 기존 min(요리 횟수) × 80 EXP/회 (요리 완료+사진 인증 1회 보상).
// 출석체크(+10 EXP)가 추가로 쌓이므로 실제 레벨업은 요리 횟수 기준보다 약간 빨라짐 — 의도된 완화.
export const LEVELS: Level[] = [
  { level: 1, title: '요리 병아리',    emoji: '🐣', minExp:    0 },
  { level: 2, title: '주방 탐험가',    emoji: '🔍', minExp:  240 },
  { level: 3, title: '냉장고 파이터',  emoji: '💪', minExp:  480 },
  { level: 4, title: '집밥 장인',      emoji: '🍳', minExp:  880 },
  { level: 5, title: '요리 마스터',    emoji: '👨‍🍳', minExp: 1680 },
  { level: 6, title: '셀프 셰프',      emoji: '⭐', minExp: 2880 },
  { level: 7, title: '전설의 요리사',  emoji: '🏆', minExp: 4080 },
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
