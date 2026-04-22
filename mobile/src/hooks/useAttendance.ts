import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendanceApi';

export const attendanceKeys = {
  all: ['attendance'] as const,
  today: () => [...attendanceKeys.all, 'today'] as const,
  history: (month?: string) => [...attendanceKeys.all, 'history', month ?? 'current'] as const,
};

export function useAttendanceToday(enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: async () => (await attendanceApi.today()).data.data,
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

export function useAttendanceHistory(month?: string) {
  return useQuery({
    queryKey: attendanceKeys.history(month),
    queryFn: async () => (await attendanceApi.history(month)).data.data,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCheckInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await attendanceApi.checkIn()).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
      qc.invalidateQueries({ queryKey: ['points'] });
    },
  });
}
