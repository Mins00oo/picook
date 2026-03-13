import client from './client';
import type { AdminLoginRequest, AdminAuthResponse } from '@/types/admin';

export function login(data: AdminLoginRequest): Promise<AdminAuthResponse> {
  return client.post('/admin/auth/login', data) as Promise<AdminAuthResponse>;
}
