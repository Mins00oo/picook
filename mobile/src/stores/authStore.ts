import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';
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

export const useAuthStore = create<AuthState>((set) => ({
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
      const userJson = await SecureStore.getItemAsync(Config.USER_KEY);
      const onboardingDone = await SecureStore.getItemAsync(Config.ONBOARDING_KEY);

      if (token && userJson) {
        set({
          user: JSON.parse(userJson),
          isAuthenticated: true,
          isOnboardingDone: onboardingDone === 'true',
          isLoading: false,
        });
      } else {
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
