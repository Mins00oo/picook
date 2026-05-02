export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface RecipeStep {
  id: number;
  stepNumber: number;
  description: string;
  imageUrl: string | null;
}

export interface RecipeIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  amount: number;
  unit: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface Recipe {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  cookingTimeMinutes: number;
  servings: number;
  calories: number | null;       // v1.0 리뉴얼: 백엔드 Recipe.calories
  imageUrl: string | null;
  thumbnailUrl: string | null;
  tips: string | null;
  totalIngredients: number;
  viewCount: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  createdAt: string;
}

export interface MissingIngredient {
  id: number;
  name: string;
}

export interface RecipeSummary {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  cookingTimeMinutes: number;
  servings: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  // 추천(/recommend) 응답에만 채워짐 — 일반 카드/카테고리 리스트엔 부재
  matchingRate?: number;
  missingIngredients?: MissingIngredient[];
  // 일반 카드 응답에 추가 (저칼로리/카테고리 리스트용)
  calories?: number | null;
  viewCount?: number;
}

export interface RecommendRequest {
  ingredientIds: number[];
  maxTime?: number;
  difficulty?: Difficulty;
  servings?: number;
}

// Backend returns RecipeSummary[] directly (flat array), not wrapped
export type RecommendResponse = RecipeSummary[];

// 카테고리 카드용 — 메인 카테고리 그리드
export interface CategoryCount {
  category: string;  // 'korean' | 'western' | 'japanese' | 'other'
  count: number;
}

// 카테고리 진입 화면 페이징 응답 (Spring PageResponse 형식과 일치)
export interface RecipePage {
  content: RecipeSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
