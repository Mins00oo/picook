import client from './client';
import type { PageResponse } from '@/types/common';
import type {
  AdminUserListItem,
  AdminUserDetail,
  AdminCookingCompletionItem,
  AdminFavoriteItem,
  AdminSearchHistoryItem,
} from '@/types/user';

interface UserListParams {
  status?: string;
  loginType?: string;
  levelMin?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

interface PaginationParams {
  page?: number;
  size?: number;
}

export function getUsers(params: UserListParams): Promise<PageResponse<AdminUserListItem>> {
  return client.get('/admin/users', { params }) as Promise<PageResponse<AdminUserListItem>>;
}

export function getUser(id: string): Promise<AdminUserDetail> {
  return client.get(`/admin/users/${id}`) as Promise<AdminUserDetail>;
}

export function suspendUser(id: string, reason: string): Promise<void> {
  return client.patch(`/admin/users/${id}/suspend`, { reason }) as Promise<void>;
}

export function activateUser(id: string): Promise<void> {
  return client.patch(`/admin/users/${id}/activate`) as Promise<void>;
}

export function getUserCompletions(
  id: string,
  params?: PaginationParams,
): Promise<PageResponse<AdminCookingCompletionItem>> {
  return client.get(`/admin/users/${id}/completions`, { params }) as Promise<
    PageResponse<AdminCookingCompletionItem>
  >;
}

export function getUserFavorites(
  id: string,
  params?: PaginationParams,
): Promise<PageResponse<AdminFavoriteItem>> {
  return client.get(`/admin/users/${id}/favorites`, { params }) as Promise<
    PageResponse<AdminFavoriteItem>
  >;
}

export function getUserSearchHistory(
  id: string,
  params?: PaginationParams,
): Promise<PageResponse<AdminSearchHistoryItem>> {
  return client.get(`/admin/users/${id}/search-history`, { params }) as Promise<
    PageResponse<AdminSearchHistoryItem>
  >;
}
