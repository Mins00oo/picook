import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { Loading } from '../src/components/common/Loading';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (!user?.displayName || !user?.characterType) {
      // 로그인은 했지만 프로필(닉네임+캐릭터) 셋업 미완료
      router.replace('/(auth)/setup');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <Loading message="잠시만 기다려 주세요..." />;
}
