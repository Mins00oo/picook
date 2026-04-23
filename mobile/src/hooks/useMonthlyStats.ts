import { useQuery } from '@tanstack/react-query';
import { cookbookApi } from '../api/cookbookApi';

function formatYearMonth(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function useMonthlyCookingStats(yearMonth?: string) {
  const ym = yearMonth ?? formatYearMonth();
  return useQuery({
    queryKey: ['cookbook', 'stats', ym],
    queryFn: async () => (await cookbookApi.stats(ym)).data.data,
    staleTime: 1000 * 60 * 5,
  });
}
