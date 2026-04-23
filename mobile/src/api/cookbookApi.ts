import api from './client';
import type { ApiResponse } from '../types/api';
import type { Outfit } from '../types/outfit';

export interface CookbookEntry {
  id: number;
  recipeId: number;
  recipeTitle: string;
  recipeThumbnailUrl: string | null;
  recipeCategory: string;
  recipeDifficulty: string;
  cookingTimeMinutes: number;
  rating: number;
  memo: string | null;
  photoUrls: string[];
  cookedAt: string;
  createdAt: string;
  // 응답 전용(생성 직후) 필드들
  pointsEarned: number | null;
  expEarned: number | null;
  sequenceNumber: number | null; // 유저별 N번째 기록 (사진 있는 entry 기준)
  leveledUp: boolean;
  newLevel: number | null;
  grantedOutfits: Outfit[];
}

export interface CookbookMonthlyStats {
  yearMonth: string; // yyyy-MM
  monthlyCount: number;
}

export interface CookbookEntryPage {
  content: CookbookEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateCookbookEntryInput {
  recipeId: number;
  rating: number;      // 1~5
  memo?: string;
  photoUris: string[]; // file:// URIs from expo-image-picker
}

function buildFormData(input: CreateCookbookEntryInput): FormData {
  const fd = new FormData();
  fd.append('recipeId', String(input.recipeId));
  fd.append('rating', String(input.rating));
  if (input.memo && input.memo.trim()) fd.append('memo', input.memo.trim());

  input.photoUris.forEach((uri, idx) => {
    // RN's FormData expects the { uri, name, type } object shape
    const ext = (uri.match(/\.(\w+)(?:\?.*)?$/)?.[1] ?? 'jpg').toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
    // RN FormData accepts { uri, name, type } file objects; TS DOM types don't know
    fd.append('photos', {
      uri,
      name: `photo_${idx}.${ext}`,
      type: mime,
    } as unknown as Blob);
  });
  return fd;
}

export const cookbookApi = {
  create: (input: CreateCookbookEntryInput) =>
    api.post<ApiResponse<CookbookEntry>>('/api/v1/cookbook/entries', buildFormData(input), {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: (data) => data, // axios가 FormData를 건드리지 못하게
    }),

  list: (page = 0, size = 20) =>
    api.get<ApiResponse<CookbookEntryPage>>('/api/v1/cookbook/entries', {
      params: { page, size },
    }),

  getDetail: (id: number) =>
    api.get<ApiResponse<CookbookEntry>>(`/api/v1/cookbook/entries/${id}`),

  stats: (yearMonth?: string) =>
    api.get<ApiResponse<CookbookMonthlyStats>>('/api/v1/cookbook/stats', {
      params: yearMonth ? { yearMonth } : undefined,
    }),
};
