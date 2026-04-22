import api from './client';
import type { ApiResponse } from '../types/api';

export type PointReason = 'DAILY_CHECK' | 'COOKBOOK_ENTRY' | 'SHOP_PURCHASE' | 'ADMIN_ADJUST';

export interface PointBalance {
  balance: number;
}

export interface PointHistoryItem {
  id: number;
  amount: number; // signed: + 적립 / - 사용
  reason: PointReason;
  refType: string | null;
  refId: number | null;
  balanceAfter: number;
  createdAt: string;
}

export interface PointHistoryPage {
  content: PointHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const pointApi = {
  balance: () =>
    api.get<ApiResponse<PointBalance>>('/api/v1/points/balance'),

  history: (page = 0, size = 20) =>
    api.get<ApiResponse<PointHistoryPage>>('/api/v1/points/history', {
      params: { page, size },
    }),
};
