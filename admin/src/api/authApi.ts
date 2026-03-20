import client from './client';
import type {
  AdminLoginRequest,
  AdminAuthResponse,
  AdminMeResponse,
  AdminRefreshRequest,
  AdminChangePasswordRequest,
} from '@/types/admin';

export function login(data: AdminLoginRequest): Promise<AdminAuthResponse> {
  return client.post('/admin/auth/login', data) as Promise<AdminAuthResponse>;
}

export function logout(): Promise<void> {
  return client.post('/admin/auth/logout') as Promise<void>;
}

export function getMe(): Promise<AdminMeResponse> {
  return client.get('/admin/auth/me') as Promise<AdminMeResponse>;
}

export function refreshToken(data: AdminRefreshRequest): Promise<AdminAuthResponse> {
  return client.post('/admin/auth/refresh', data) as Promise<AdminAuthResponse>;
}

export function changePassword(data: AdminChangePasswordRequest): Promise<void> {
  return client.put('/admin/auth/password', data) as Promise<void>;
}
