import React, { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { useAuthStore } from '../src/stores/authStore';
import { queryClient } from '../src/lib/queryClient';
import { initErrorReporting } from '../src/lib/errorReporting';
import { AppErrorBoundary } from '../src/components/common/AppErrorBoundary';

// 앱 모듈 로드 시점 1회 — 에러 리포터(Sentry placeholder) 초기화
initErrorReporting();

SplashScreen.preventAutoHideAsync();

/**
 * 앱 최초 진입 시 한 번만 알림 권한 요청. 이미 허용/거부된 상태면 스킵.
 * 출석 리마인더·레벨업 푸시 발송 시점에 필요.
 * Expo Go에서는 Android 원격 푸시가 막혀있지만 로컬 알림/iOS는 동작.
 */
async function ensureNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'undetermined') {
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
    }
  } catch {
    // 권한 체크 실패해도 앱은 정상 실행
  }
}

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
  });

  useEffect(() => {
    loadFromStorage();
    ensureNotificationPermission();
  }, [loadFromStorage]);

  const onLayoutReady = useCallback(async () => {
    if (!isLoading && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded]);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  if (isLoading || !fontsLoaded) {
    return null; // 스플래시 스크린 유지
  }

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cooking" />
          <Stack.Screen name="points" />
          <Stack.Screen name="shop" />
        </Stack>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
