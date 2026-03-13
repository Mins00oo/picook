import client from './client';
import type { PageResponse } from '@/types/common';
import type { AdminUserListItem, AdminUserDetail } from '@/types/user';

interface UserListParams {
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export function getUsers(params: UserListParams): Promise<PageResponse<AdminUserListItem>> {
  return client.get('/admin/users', { params }) as Promise<PageResponse<AdminUserListItem>>;
}

export function getUser(id: string): Promise<AdminUserDetail> {
  return client.get(`/admin/users/${id}`) as Promise<AdminUserDetail>;
}

export function suspendUser(id: string): Promise<void> {
  return client.patch(`/admin/users/${id}/suspend`) as Promise<void>;
}

export function activateUser(id: string): Promise<void> {
  return client.patch(`/admin/users/${id}/activate`) as Promise<void>;
}
