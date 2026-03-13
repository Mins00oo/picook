import client from './client';
import type { PageResponse } from '@/types/common';
import type { FeedbackItem, FeedbackDetailResponse, UpdateFeedbackRequest } from '@/types/feedback';

interface FeedbackListParams {
  status?: string;
  rating?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export function getFeedbackList(params: FeedbackListParams): Promise<PageResponse<FeedbackItem>> {
  return client.get('/admin/feedback', { params }) as Promise<PageResponse<FeedbackItem>>;
}

export function getFeedback(id: number): Promise<FeedbackDetailResponse> {
  return client.get(`/admin/feedback/${id}`) as Promise<FeedbackDetailResponse>;
}

export function updateFeedbackStatus(id: number, data: UpdateFeedbackRequest): Promise<FeedbackDetailResponse> {
  return client.patch(`/admin/feedback/${id}`, data) as Promise<FeedbackDetailResponse>;
}
