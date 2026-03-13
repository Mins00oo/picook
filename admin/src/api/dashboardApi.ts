import client from './client';
import type { DashboardStats } from '@/types/stats';

export function getDashboardStats(period: string = '7d'): Promise<DashboardStats> {
  return client.get('/admin/dashboard', { params: { period } }) as Promise<DashboardStats>;
}
