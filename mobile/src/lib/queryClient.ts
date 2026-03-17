import { QueryClient } from '@tanstack/react-query';
import { Config } from '../constants/config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Config.QUERY_STALE_TIME,
      retry: 2,
    },
  },
});
