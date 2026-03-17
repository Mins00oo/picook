import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request: JWT 자동 첨부 ---
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(Config.JWT_ACCESS_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: 401 큐잉 + 에러 핸들링 ---
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 — 토큰 갱신
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 갱신 중이면 큐에 추가, 완료 후 재시도
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(Config.JWT_REFRESH_KEY);
        if (!refreshToken) {
          processQueue(error, null);
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

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 네트워크 끊김 (response 없음)
    if (!error.response) {
      Alert.alert('네트워크 오류', '인터넷 연결을 확인해주세요.');
      return Promise.reject(error);
    }

    // HTTP 상태별 에러 처리
    const status = error.response.status;
    if (status === 429) {
      Alert.alert('잠시만요', '요청이 너무 많아요. 잠시 후 시도해주세요.');
    } else if (status >= 500) {
      Alert.alert('서버 오류', '일시적인 오류예요. 잠시 후 다시 시도해주세요.');
    }
    // 400번대는 호출측에서 서버 메시지를 직접 처리

    return Promise.reject(error);
  },
);

async function clearTokens() {
  await SecureStore.deleteItemAsync(Config.JWT_ACCESS_KEY);
  await SecureStore.deleteItemAsync(Config.JWT_REFRESH_KEY);
}

export default api;
