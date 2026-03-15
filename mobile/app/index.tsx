import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { Loading } from '../src/components/common/Loading';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isOnboardingDone } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isOnboardingDone) {
      router.replace('/(auth)/onboarding');
    } else if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, isAuthenticated, isOnboardingDone, router]);

  return <Loading message="잠시만 기다려 주세요..." />;
}
