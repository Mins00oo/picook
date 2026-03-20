import client from './client';
import type { PageResponse } from '@/types/common';
import type { ShortsCacheItem, ShortsCacheDetail, ShortsStatsData } from '@/types/shorts';

interface ShortsCacheParams {
  keyword?: string;
  modelVersion?: string;
  page?: number;
  size?: number;
}

export function getShortsCacheList(params: ShortsCacheParams): Promise<PageResponse<ShortsCacheItem>> {
  return client.get('/admin/shorts/cache', { params }) as Promise<PageResponse<ShortsCacheItem>>;
}

export function getShortsCacheDetail(id: number): Promise<ShortsCacheDetail> {
  return client.get(`/admin/shorts/cache/${id}`) as Promise<ShortsCacheDetail>;
}

export function deleteShortCache(id: number): Promise<void> {
  return client.delete(`/admin/shorts/cache/${id}`) as Promise<void>;
}

export function reconvertShorts(id: number): Promise<ShortsCacheDetail> {
  return client.post(`/admin/shorts/cache/${id}/reconvert`) as Promise<ShortsCacheDetail>;
}

export function clearAllShortsCache(): Promise<void> {
  return client.delete('/admin/shorts/cache/clear-all') as Promise<void>;
}

export function getShortsStats(): Promise<ShortsStatsData> {
  return client.get('/admin/shorts/stats') as Promise<ShortsStatsData>;
}
