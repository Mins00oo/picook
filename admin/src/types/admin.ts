export type AdminRole = 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'VIEWER';

export interface AdminInfo {
  id: number;
  email: string;
  role: AdminRole;
}

export interface AdminAccountItem {
  id: number;
  email: string;
  role: AdminRole;
  isLocked: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminInfo;
}

export interface AdminMeResponse {
  id: number;
  email: string;
  role: AdminRole;
}

export interface AdminChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdminRefreshRequest {
  refreshToken: string;
}
