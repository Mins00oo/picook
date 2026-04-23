import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';
import { userApi } from '../api/userApi';
import { queryClient } from '../lib/queryClient';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync(Config.JWT_ACCESS_KEY, accessToken);
    await SecureStore.setItemAsync(Config.JWT_REFRESH_KEY, refreshToken);
    set({ isAuthenticated: true });
  },

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync(Config.JWT_ACCESS_KEY);

      if (!token) {
        set({ isLoading: false });
        return;
      }

      try {
        const { data } = await userApi.getMe();
        const user = data.data;
        await SecureStore.setItemAsync(Config.USER_KEY, JSON.stringify(user));
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        await get().logout();
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(Config.JWT_ACCESS_KEY);
    await SecureStore.deleteItemAsync(Config.JWT_REFRESH_KEY);
    await SecureStore.deleteItemAsync(Config.USER_KEY);
    // 이전 유저의 react-query 캐시(쿡북·포인트·의상 등)가 다음 유저에게 보이지 않도록
    queryClient.clear();
    set({ user: null, isAuthenticated: false });
  },
}));
