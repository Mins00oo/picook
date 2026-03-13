export type AdminRole = 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'VIEWER';

export interface AdminInfo {
  id: number;
  email: string;
  role: AdminRole;
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
