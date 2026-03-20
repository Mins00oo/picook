import client from './client';
import type { AdminAccountItem, AdminRole } from '@/types/admin';

export interface CreateAdminRequest {
  email: string;
  password: string;
  role: AdminRole;
}

export function getAdminAccounts(): Promise<AdminAccountItem[]> {
  return client.get('/admin/accounts') as Promise<AdminAccountItem[]>;
}

export function createAdmin(data: CreateAdminRequest): Promise<AdminAccountItem> {
  return client.post('/admin/accounts', data) as Promise<AdminAccountItem>;
}

export function updateAdminRole(id: number, role: AdminRole): Promise<AdminAccountItem> {
  return client.put(`/admin/accounts/${id}`, { role }) as Promise<AdminAccountItem>;
}

export function deleteAdmin(id: number, adminId: number): Promise<void> {
  return client.delete(`/admin/accounts/${id}`, {
    headers: { 'X-Admin-Id': adminId },
  }) as Promise<void>;
}

export function unlockAdmin(id: number): Promise<void> {
  return client.patch(`/admin/accounts/${id}/unlock`) as Promise<void>;
}
