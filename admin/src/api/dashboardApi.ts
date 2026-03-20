import client from './client';
import type { DashboardSummary, DashboardRankings, DashboardCharts, DashboardData } from '@/types/stats';

export async function getDashboardData(period: string = '7d'): Promise<DashboardData> {
  const [summary, rankings, charts] = await Promise.all([
    client.get('/admin/dashboard/summary') as Promise<DashboardSummary>,
    client.get('/admin/dashboard/rankings') as Promise<DashboardRankings>,
    client.get('/admin/dashboard/charts', { params: { period } }) as Promise<DashboardCharts>,
  ]);
  return { summary, rankings, charts };
}
