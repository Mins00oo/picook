import api from './client';
import type { ApiResponse } from '../types/api';

export interface AttendanceToday {
  checkDate: string;        // yyyy-MM-dd
  checkedIn: boolean;
  streakDays: number;
  recentSevenDays: number[]; // 7 items, 0=not checked, 1=checked
}

export interface CheckInResult {
  checkDate: string;
  streakDays: number;
  pointsEarned: number;
  pointBalance: number;
}

export interface MonthHistory {
  month: string;            // yyyy-MM
  checkedDates: string[];   // yyyy-MM-dd list
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
}

export const attendanceApi = {
  today: () =>
    api.get<ApiResponse<AttendanceToday>>('/api/v1/attendance/today'),

  checkIn: () =>
    api.post<ApiResponse<CheckInResult>>('/api/v1/attendance/check-in'),

  history: (month?: string) =>
    api.get<ApiResponse<MonthHistory>>('/api/v1/attendance/history', {
      params: month ? { month } : undefined,
    }),
};
