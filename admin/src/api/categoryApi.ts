import client from './client';
import type {
  AdminCategoryResponse,
  AdminCategoryRequest,
  CategoryReorderRequest,
} from '@/types/ingredient';

export function getCategories(): Promise<AdminCategoryResponse[]> {
  return client.get('/admin/categories') as Promise<AdminCategoryResponse[]>;
}

export function createCategory(data: AdminCategoryRequest): Promise<AdminCategoryResponse> {
  return client.post('/admin/categories', data) as Promise<AdminCategoryResponse>;
}

export function updateCategory(id: number, data: AdminCategoryRequest): Promise<AdminCategoryResponse> {
  return client.put(`/admin/categories/${id}`, data) as Promise<AdminCategoryResponse>;
}

export function deleteCategory(id: number): Promise<void> {
  return client.delete(`/admin/categories/${id}`) as Promise<void>;
}

export function reorderCategories(data: CategoryReorderRequest): Promise<void> {
  return client.put('/admin/categories/reorder', data) as Promise<void>;
}
