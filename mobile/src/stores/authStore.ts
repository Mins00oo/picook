import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';
import { userApi } from '../api/userApi';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingDone: boolean;

  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  logout: () => Promise<void>;
  setOnboardingDone: () => Promise<void>;
  checkOnboarding: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboardingDone: false,

  setUser: (user) => set({ user }),

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync(Config.JWT_ACCESS_KEY, accessToken);
    await SecureStore.setItemAsync(Config.JWT_REFRESH_KEY, refreshToken);
    set({ isAuthenticated: true });
  },

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync(Config.JWT_ACCESS_KEY);
      const onboardingDone = await SecureStore.getItemAsync(Config.ONBOARDING_KEY);
      const isOnboarded = onboardingDone === 'true';

      if (!token) {
        set({ isLoading: false, isOnboardingDone: isOnboarded });
        return;
      }

      // 서버에서 프로필 검증
      try {
        const { data } = await userApi.getMe();
        const user = data.data;
        await SecureStore.setItemAsync(Config.USER_KEY, JSON.stringify(user));
        set({
          user,
          isAuthenticated: true,
          isOnboardingDone: isOnboarded,
          isLoading: false,
        });
      } catch {
        // 401 → client.ts 인터셉터가 refresh 시도 → 실패 시 토큰 삭제됨
        // 토큰이 아직 존재하면 로컬 캐시로 폴백, 없으면 로그아웃
        const tokenStillExists = await SecureStore.getItemAsync(Config.JWT_ACCESS_KEY);
        const userJson = await SecureStore.getItemAsync(Config.USER_KEY);
        if (tokenStillExists && userJson) {
          set({
            user: JSON.parse(userJson),
            isAuthenticated: true,
            isOnboardingDone: isOnboarded,
            isLoading: false,
          });
        } else {
          await get().logout();
          set({ isLoading: false, isOnboardingDone: isOnboarded });
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(Config.JWT_ACCESS_KEY);
    await SecureStore.deleteItemAsync(Config.JWT_REFRESH_KEY);
    await SecureStore.deleteItemAsync(Config.USER_KEY);
    set({ user: null, isAuthenticated: false });
  },

  setOnboardingDone: async () => {
    await SecureStore.setItemAsync(Config.ONBOARDING_KEY, 'true');
    set({ isOnboardingDone: true });
  },

  checkOnboarding: async () => {
    const done = await SecureStore.getItemAsync(Config.ONBOARDING_KEY);
    const isDone = done === 'true';
    set({ isOnboardingDone: isDone });
    return isDone;
  },
}));
