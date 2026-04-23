import client from './client';
import type { AdminOutfit, AdminOutfitRequest } from '@/types/outfit';

export function getOutfits(): Promise<AdminOutfit[]> {
  return client.get('/admin/outfits') as Promise<AdminOutfit[]>;
}

export function createOutfit(data: AdminOutfitRequest): Promise<AdminOutfit> {
  return client.post('/admin/outfits', data) as Promise<AdminOutfit>;
}

export function updateOutfit(id: number, data: AdminOutfitRequest): Promise<AdminOutfit> {
  return client.put(`/admin/outfits/${id}`, data) as Promise<AdminOutfit>;
}

export function deleteOutfit(id: number): Promise<void> {
  return client.delete(`/admin/outfits/${id}`) as Promise<void>;
}
