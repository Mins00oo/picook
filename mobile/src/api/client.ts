import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';
import { queryClient } from './queryClient';

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// --- 네트워크 Alert 글로벌 억제 (recovery 등에서 사용) ---
let _suppressNetworkAlerts = false;
export function setSuppressNetworkAlerts(suppress: boolean) {
  _suppressNetworkAlerts = suppress;
}

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
      // _skipNetworkAlert: 요청별 억제 / _suppressNetworkAlerts: 글로벌 억제
      const config = error.config as InternalAxiosRequestConfig & { _skipNetworkAlert?: boolean };
      if (!config?._skipNetworkAlert && !_suppressNetworkAlerts) {
        Alert.alert('네트워크 오류', '인터넷 연결을 확인해주세요.');
      }
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
  // 401 리프레시 실패 등 "비정상 세션 종료" 시 호출.
  // 토큰 + 유저 프로필 캐시 + react-query 서버 상태 전부 비워서
  // 다음 로그인 유저에게 이전 세션 데이터가 남지 않도록.
  await SecureStore.deleteItemAsync(Config.JWT_ACCESS_KEY);
  await SecureStore.deleteItemAsync(Config.JWT_REFRESH_KEY);
  await SecureStore.deleteItemAsync(Config.USER_KEY);
  queryClient.clear();
  // zustand 상태도 초기화 (동적 require로 순환 import 회피)
  try {
    const { useAuthStore } = require('../stores/authStore');
    useAuthStore.setState({ user: null, isAuthenticated: false });
  } catch {
    // 초기 로드 타이밍엔 store가 아직 준비 안 됐을 수 있음 — 무시
  }
}

export default api;
