import client from './client';
import type { PageResponse } from '@/types/common';
import type {
  AdminIngredientResponse,
  AdminIngredientRequest,
  IngredientBulkUploadResponse,
  IngredientListFilters,
  IngredientStatsResponse,
  BulkDeleteRequest,
  BulkDeleteResponse,
  BulkMoveRequest,
} from '@/types/ingredient';

export function getIngredients(
  filters: IngredientListFilters = {},
): Promise<PageResponse<AdminIngredientResponse>> {
  return client.get('/admin/ingredients', { params: filters }) as Promise<
    PageResponse<AdminIngredientResponse>
  >;
}

export function getIngredient(id: number): Promise<AdminIngredientResponse> {
  return client.get(`/admin/ingredients/${id}`) as Promise<AdminIngredientResponse>;
}

export function createIngredient(
  data: AdminIngredientRequest,
): Promise<AdminIngredientResponse> {
  return client.post('/admin/ingredients', data) as Promise<AdminIngredientResponse>;
}

export function updateIngredient(
  id: number,
  data: AdminIngredientRequest,
): Promise<AdminIngredientResponse> {
  return client.put(`/admin/ingredients/${id}`, data) as Promise<AdminIngredientResponse>;
}

export function deleteIngredient(id: number): Promise<void> {
  return client.delete(`/admin/ingredients/${id}`) as Promise<void>;
}

export function bulkUploadIngredients(
  file: File,
  dryRun = false,
): Promise<IngredientBulkUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/admin/ingredients/bulk-upload', formData, {
    params: { dryRun },
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<IngredientBulkUploadResponse>;
}

export function downloadIngredientTemplate(): Promise<Blob> {
  return client.get('/admin/ingredients/bulk-template', {
    responseType: 'blob',
  }) as Promise<Blob>;
}

export function exportIngredients(filters: {
  categoryId?: number;
  subcategoryId?: number;
  keyword?: string;
} = {}): Promise<Blob> {
  return client.get('/admin/ingredients/export', {
    params: filters,
    responseType: 'blob',
  }) as Promise<Blob>;
}

export function getIngredientStats(): Promise<IngredientStatsResponse> {
  return client.get('/admin/ingredients/stats') as Promise<IngredientStatsResponse>;
}

export function bulkDeleteIngredients(req: BulkDeleteRequest): Promise<BulkDeleteResponse> {
  return client.post('/admin/ingredients/bulk-delete', req) as Promise<BulkDeleteResponse>;
}

export function bulkMoveIngredients(req: BulkMoveRequest): Promise<void> {
  return client.patch('/admin/ingredients/bulk-move', req) as Promise<void>;
}
