import client from './client';
import type { PageResponse } from '@/types/common';
import type { ShortsCacheItem, ShortsConvertResult } from '@/types/shorts';

interface ShortsCacheParams {
  keyword?: string;
  aiModelVersion?: string;
  page?: number;
  size?: number;
}

export function getShortsCacheList(params: ShortsCacheParams): Promise<PageResponse<ShortsCacheItem>> {
  return client.get('/admin/shorts', { params }) as Promise<PageResponse<ShortsCacheItem>>;
}

export function getShortsCacheDetail(id: number): Promise<ShortsConvertResult> {
  return client.get(`/admin/shorts/${id}`) as Promise<ShortsConvertResult>;
}

export function deleteShortCache(id: number): Promise<void> {
  return client.delete(`/admin/shorts/${id}`) as Promise<void>;
}

export function reconvertShorts(id: number): Promise<ShortsConvertResult> {
  return client.post(`/admin/shorts/${id}/reconvert`) as Promise<ShortsConvertResult>;
}

export function clearAllShortsCache(): Promise<void> {
  return client.delete('/admin/shorts/all') as Promise<void>;
}
