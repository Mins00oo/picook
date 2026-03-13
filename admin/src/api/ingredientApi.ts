import client from './client';
import type { PageResponse } from '@/types/common';
import type {
  AdminIngredientResponse,
  AdminIngredientRequest,
  IngredientBulkUploadResponse,
} from '@/types/ingredient';

interface IngredientListParams {
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export function getIngredients(params: IngredientListParams): Promise<PageResponse<AdminIngredientResponse>> {
  return client.get('/admin/ingredients', { params }) as Promise<PageResponse<AdminIngredientResponse>>;
}

export function getIngredient(id: number): Promise<AdminIngredientResponse> {
  return client.get(`/admin/ingredients/${id}`) as Promise<AdminIngredientResponse>;
}

export function createIngredient(data: AdminIngredientRequest): Promise<AdminIngredientResponse> {
  return client.post('/admin/ingredients', data) as Promise<AdminIngredientResponse>;
}

export function updateIngredient(id: number, data: AdminIngredientRequest): Promise<AdminIngredientResponse> {
  return client.put(`/admin/ingredients/${id}`, data) as Promise<AdminIngredientResponse>;
}

export function deleteIngredient(id: number): Promise<void> {
  return client.delete(`/admin/ingredients/${id}`) as Promise<void>;
}

export function bulkUploadIngredients(file: File): Promise<IngredientBulkUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/admin/ingredients/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<IngredientBulkUploadResponse>;
}

export function downloadIngredientTemplate(): Promise<Blob> {
  return client.get('/admin/ingredients/bulk-template', {
    responseType: 'blob',
  }) as Promise<Blob>;
}
