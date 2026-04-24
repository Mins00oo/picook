import client from './client';
import type {
  AdminSubcategory,
  AdminSubcategoryRequest,
  ReorderSubcategoryRequest,
} from '@/types/subcategory';

export function getSubcategories(categoryId?: number): Promise<AdminSubcategory[]> {
  return client.get('/admin/subcategories', {
    params: categoryId !== undefined ? { categoryId } : undefined,
  }) as Promise<AdminSubcategory[]>;
}

export function createSubcategory(data: AdminSubcategoryRequest): Promise<AdminSubcategory> {
  return client.post('/admin/subcategories', data) as Promise<AdminSubcategory>;
}

export function updateSubcategory(
  id: number,
  data: AdminSubcategoryRequest,
): Promise<AdminSubcategory> {
  return client.put(`/admin/subcategories/${id}`, data) as Promise<AdminSubcategory>;
}

export function deleteSubcategory(id: number): Promise<void> {
  return client.delete(`/admin/subcategories/${id}`) as Promise<void>;
}

export function reorderSubcategories(req: ReorderSubcategoryRequest): Promise<void> {
  return client.put('/admin/subcategories/reorder', req) as Promise<void>;
}
