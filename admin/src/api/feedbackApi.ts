import client from './client';
import type { PageResponse } from '@/types/common';
import type {
  FeedbackItem,
  FeedbackDetailResponse,
  UpdateFeedbackStatusRequest,
  UpdateFeedbackNoteRequest,
} from '@/types/feedback';

interface FeedbackListParams {
  status?: string;
  rating?: string;
  recipeId?: number;
  page?: number;
  size?: number;
}

export function getFeedbackList(params: FeedbackListParams): Promise<PageResponse<FeedbackItem>> {
  return client.get('/admin/feedback', { params }) as Promise<PageResponse<FeedbackItem>>;
}

export function getFeedback(id: number): Promise<FeedbackDetailResponse> {
  return client.get(`/admin/feedback/${id}`) as Promise<FeedbackDetailResponse>;
}

export function updateFeedbackStatus(id: number, data: UpdateFeedbackStatusRequest): Promise<void> {
  return client.patch(`/admin/feedback/${id}/status`, data) as Promise<void>;
}

export function updateFeedbackNote(id: number, data: UpdateFeedbackNoteRequest): Promise<void> {
  return client.put(`/admin/feedback/${id}/note`, data) as Promise<void>;
}

export function getFeedbackSummary(): Promise<unknown> {
  return client.get('/admin/feedback/summary') as Promise<unknown>;
}
