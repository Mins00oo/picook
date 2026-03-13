import client from './client';
import type { AdminInfo, AdminRole } from '@/types/admin';

export interface CreateAdminRequest {
  email: string;
  password: string;
  role: AdminRole;
}

export function getAdminAccounts(): Promise<AdminInfo[]> {
  return client.get('/admin/accounts') as Promise<AdminInfo[]>;
}

export function createAdmin(data: CreateAdminRequest): Promise<AdminInfo> {
  return client.post('/admin/accounts', data) as Promise<AdminInfo>;
}

export function updateAdminRole(id: number, role: AdminRole): Promise<AdminInfo> {
  return client.patch(`/admin/accounts/${id}/role`, { role }) as Promise<AdminInfo>;
}

export function deleteAdmin(id: number): Promise<void> {
  return client.delete(`/admin/accounts/${id}`) as Promise<void>;
}
