export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatCookTime(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

export function formatDifficulty(difficulty: string): string {
  switch ((difficulty ?? '').toUpperCase()) {
    case 'EASY':
      return '쉬움';
    case 'MEDIUM':
      return '보통';
    case 'HARD':
      return '어려움';
    default:
      return difficulty;
  }
}

const CATEGORY_KO: Record<string, string> = {
  korean: '한식',
  western: '양식',
  chinese: '중식',
  japanese: '일식',
  snack: '분식',
  dessert: '디저트',
  drink: '음료',
  other: '기타',
};

export function formatCategory(category: string): string {
  return CATEGORY_KO[(category ?? '').toLowerCase()] ?? category;
}

export function formatServings(servings: number): string {
  return `${servings}인분`;
}

export function formatMatchRate(rate: number): string {
  return `${Math.round(rate)}%`;
}

/**
 * 상대 경로 이미지 URL을 절대 URL로 변환
 * "/uploads/..." → "http://baseUrl/uploads/..."
 * 이미 절대 URL이면 그대로 반환
 */
export function toAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Config } = require('../constants/config');
  return `${Config.API_BASE_URL}${url}`;
}
