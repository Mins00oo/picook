import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(Config.JWT_ACCESS_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(Config.JWT_REFRESH_KEY);
        if (!refreshToken) {
          await clearTokens();
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          `${Config.API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
        );

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        await SecureStore.setItemAsync(Config.JWT_ACCESS_KEY, newAccessToken);
        if (newRefreshToken) {
          await SecureStore.setItemAsync(Config.JWT_REFRESH_KEY, newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        await clearTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

async function clearTokens() {
  await SecureStore.deleteItemAsync(Config.JWT_ACCESS_KEY);
  await SecureStore.deleteItemAsync(Config.JWT_REFRESH_KEY);
}

export default api;
