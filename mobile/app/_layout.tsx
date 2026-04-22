import React, { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useAuthStore } from '../src/stores/authStore';
import { queryClient } from '../src/lib/queryClient';

SplashScreen.preventAutoHideAsync();

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
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cooking" />
      </Stack>
    </QueryClientProvider>
  );
}
