import { create } from 'zustand';
import type { AdminInfo, AdminRole } from '@/types/admin';

interface AuthState {
  token: string | null;
  admin: AdminInfo | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: AdminInfo) => void;
  logout: () => void;
  hasRole: (role: AdminRole) => boolean;
  canWrite: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: localStorage.getItem('accessToken'),
  admin: (() => {
    try {
      const stored = localStorage.getItem('admin');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  setAuth: (token, admin) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('admin', JSON.stringify(admin));
    set({ token, admin, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('admin');
    set({ token: null, admin: null, isAuthenticated: false });
  },

  hasRole: (role) => get().admin?.role === role,

  canWrite: () => {
    const role = get().admin?.role;
    return role === 'SUPER_ADMIN' || role === 'CONTENT_ADMIN';
  },
}));
