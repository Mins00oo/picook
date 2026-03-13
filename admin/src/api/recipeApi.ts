import client from './client';
import type { PageResponse } from '@/types/common';
import type {
  AdminRecipeListItem,
  AdminRecipeDetail,
  AdminRecipeRequest,
  RecipeBulkUploadResponse,
} from '@/types/recipe';

interface RecipeListParams {
  status?: string;
  category?: string;
  difficulty?: string;
  coachingReady?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export function getRecipes(params: RecipeListParams): Promise<PageResponse<AdminRecipeListItem>> {
  return client.get('/admin/recipes', { params }) as Promise<PageResponse<AdminRecipeListItem>>;
}

export function getRecipe(id: number): Promise<AdminRecipeDetail> {
  return client.get(`/admin/recipes/${id}`) as Promise<AdminRecipeDetail>;
}

export function createRecipe(data: AdminRecipeRequest): Promise<AdminRecipeDetail> {
  return client.post('/admin/recipes', data) as Promise<AdminRecipeDetail>;
}

export function updateRecipe(id: number, data: AdminRecipeRequest): Promise<AdminRecipeDetail> {
  return client.put(`/admin/recipes/${id}`, data) as Promise<AdminRecipeDetail>;
}

export function deleteRecipe(id: number): Promise<void> {
  return client.delete(`/admin/recipes/${id}`) as Promise<void>;
}

export function changeRecipeStatus(id: number, status: string): Promise<AdminRecipeDetail> {
  return client.patch(`/admin/recipes/${id}/status`, { status }) as Promise<AdminRecipeDetail>;
}

export function bulkUploadRecipes(file: File): Promise<RecipeBulkUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/admin/recipes/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<RecipeBulkUploadResponse>;
}

export function downloadRecipeTemplate(): Promise<Blob> {
  return client.get('/admin/recipes/bulk-template', {
    responseType: 'blob',
  }) as Promise<Blob>;
}
