// Design System — Picook Mobile
// PIC-20: 앱스토어 출시 품질 디자인 시스템

export const colors = {
  // Primary (따뜻한 오렌지 계열)
  primary: '#FF6B35',
  primaryLight: '#FFF3ED',
  primaryDark: '#E85D2C',

  // Secondary (민트/그린 — 포인트 + 성공 상태)
  secondary: '#2EC4B6',
  secondaryLight: '#E8F8F5',

  // Neutral
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E8E8E8',
  divider: '#F0F0F0',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Coaching
  active: '#3B82F6',
  wait: '#F59E0B',

  // Multi coaching
  recipeA: '#3B82F6',
  recipeB: '#F97316',

  // Legacy compat
  kakaoYellow: '#FEE500',
  kakaoBrown: '#3C1E1E',
  appleBg: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  timerBg: '#1A1A2E',
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// 카테고리 이모지 매핑
export const CATEGORY_EMOJI: Record<string, string> = {
  '전체': '🍽️',
  '채소': '🥬',
  '과일': '🍎',
  '육류': '🥩',
  '해산물': '🐟',
  '유제품/계란': '🥚',
  '유제품': '🥚',
  '곡류': '🍚',
  '곡류/면류': '🍚',
  '양념': '🧂',
  '양념/소스': '🧂',
  '기타': '📦',
};

// 재료 이모지 매핑
export const INGREDIENT_EMOJI: Record<string, string> = {
  '양파': '🧅',
  '대파': '🌿',
  '감자': '🥔',
  '당근': '🥕',
  '시금치': '🥬',
  '김치': '🌶️',
  '돼지고기': '🥩',
  '닭가슴살': '🍗',
  '소고기': '🥩',
  '새우': '🦐',
  '오징어': '🦑',
  '계란': '🥚',
  '우유': '🥛',
  '치즈': '🧀',
  '밥': '🍚',
  '간장': '🫘',
  '된장': '🫘',
  '고추장': '🌶️',
  '소금': '🧂',
  '설탕': '🍬',
  '참기름': '🫒',
  '두부': '🧊',
  '마늘': '🧄',
  '고구마': '🍠',
  '버섯': '🍄',
  '토마토': '🍅',
  '옥수수': '🌽',
  '브로콜리': '🥦',
  '아보카도': '🥑',
  '레몬': '🍋',
  '바나나': '🍌',
  '사과': '🍎',
  '딸기': '🍓',
  '포도': '🍇',
  '수박': '🍉',
  '복숭아': '🍑',
  '파인애플': '🍍',
  '고추': '🌶️',
  '피망': '🫑',
  '오이': '🥒',
  '배추': '🥬',
  '무': '🥬',
  '콩나물': '🌱',
  '숙주': '🌱',
  '미역': '🌊',
  '라면': '🍜',
  '국수': '🍝',
  '빵': '🍞',
  '밀가루': '🌾',
  '버터': '🧈',
  '꿀': '🍯',
  '식초': '🫗',
  '후추': '🫙',
  '케첩': '🍅',
  '마요네즈': '🥫',
  '생강': '🫚',
};

export function getIngredientEmoji(name: string): string {
  return INGREDIENT_EMOJI[name] ?? '🥘';
}

export function getCategoryEmoji(name: string): string {
  // 부분 매칭도 지원 (e.g. "유제품/계란" → "유제품")
  if (CATEGORY_EMOJI[name]) return CATEGORY_EMOJI[name];
  for (const key of Object.keys(CATEGORY_EMOJI)) {
    if (name.includes(key) || key.includes(name)) return CATEGORY_EMOJI[key];
  }
  return '📦';
}
