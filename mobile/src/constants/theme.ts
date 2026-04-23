// Design System — Picook Mobile v1.0
// 프로토타입 (docs/ui-prototype/) CSS 변수와 1:1 매칭
// 폰트: Pretendard 단일 (400/500/600/700/800 웨이트 계층)

export const colors = {
  // Background / Surface (warm cream)
  background: '#FFF8F1',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Ink (warm dark)
  textPrimary: '#1F1612',
  textSecondary: '#6B5D56',
  textTertiary: '#A89B93',
  textInverse: '#FFFFFF',

  // Lines
  border: '#F0E6DC',
  line: '#F0E6DC',
  lineSoft: '#FAF3EB',
  divider: '#F0E6DC',

  // Primary (warm orange)
  primary: '#FF6B4A',
  primaryLight: '#FFEDE4', // accent-soft
  primaryDark: '#C44A1C',
  primaryGradientStart: '#FF7A5A',
  primaryGradientEnd: '#FF5A2E',

  // Accent tones
  accent: '#FF6B4A',
  accent2: '#FFD4C2',
  accentSoft: '#FFEDE4',

  // Category tone pills
  mint: '#D5E9D4',
  sun: '#FFE9A8',
  blue: '#DDE5F0',
  peach: '#FFDDC7',
  lilac: '#E7DCF0',

  // Legacy secondary (mint/green) — 다른 화면에서 임시로 사용 중
  secondary: '#2EC4B6',
  secondaryLight: '#E8F8F5',

  // Status
  success: '#3F9F63',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Rating / star (cook completion)
  star: '#FFB43B',

  // Coaching (deprecated in v1.0 but kept for compat)
  active: '#3B82F6',
  wait: '#F59E0B',

  // Multi coaching (deprecated)
  recipeA: '#3B82F6',
  recipeB: '#F97316',

  // Legacy / auth
  kakaoYellow: '#FEE500',
  kakaoBrown: '#1A1A1A',
  appleBg: '#000000',
  overlay: 'rgba(31,22,18,0.35)',
  timerBg: '#1A1A2E',

  // Dark bottom sheet (ingredient select 플로팅 카트)
  inkDark: '#1F1612',
} as const;

// 폰트 family 상수 — expo-font로 로드됨
export const fontFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extrabold: 'Pretendard-ExtraBold',
} as const;

// 웨이트 계층 기반 typography — italic·serif 절대 금지
export const typography = {
  // 히어로 (오늘 뭐 먹지? 등)
  heroTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -1,
  },
  heroTitleLg: {
    fontFamily: fontFamily.extrabold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -1.2,
  },
  // 섹션/카드 타이틀
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  // 리스트 페이지 상단 타이틀 (마이페이지, 요리북, 찜 등) — 프로토타입 G1 기준 16px
  pageTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  // 본문
  bodyBold: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  bodyProse: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  // 캡션/메타
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.1,
  },
  captionBold: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.1,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: -0.1,
  },
  // 작은 강조 (kicker, 배지)
  kicker: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.8,
  },
  // legacy 호환
  small: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
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
  xxl: 28,
  full: 9999,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#643C28',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#643C28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#643C28',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  cta: {
    shadowColor: '#FF5A2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

// 카테고리 이모지 매핑
export const CATEGORY_EMOJI: Record<string, string> = {
  '전체': '🍽️',
  '채소': '🥬',
  '과일': '🍎',
  '육류': '🥩',
  '해산물': '🐟',
  '수산물': '🐟',
  '유제품/계란': '🧀',
  '유제품': '🧀',
  '계란': '🥚',
  '곡류': '🍚',
  '곡물': '🍚',
  '곡류/면류': '🍚',
  '양념': '🧂',
  '양념/소스': '🧂',
  '기타': '📦',
};

// 재료 이모지 매핑
export const INGREDIENT_EMOJI: Record<string, string> = {
  '양파': '🧅',
  '대파': '🧅',
  '감자': '🥔',
  '당근': '🥕',
  '시금치': '🥬',
  '김치': '🌶️',
  '돼지고기': '🥩',
  '닭가슴살': '🍗',
  '닭고기': '🍗',
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
  if (CATEGORY_EMOJI[name]) return CATEGORY_EMOJI[name];
  for (const key of Object.keys(CATEGORY_EMOJI)) {
    if (name.includes(key) || key.includes(name)) return CATEGORY_EMOJI[key];
  }
  return '📦';
}
