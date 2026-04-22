import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { PicookLogo } from '../../src/components/brand/PicookLogo';
import { PotSymbol } from '../../src/components/brand/PotSymbol';
import { Config } from '../../src/constants/config';
import { useAuthStore } from '../../src/stores/authStore';
import { authApi } from '../../src/api/authApi';

export default function LoginScreen() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [loading, setLoading] = useState<'apple' | 'kakao' | null>(null);

  const routeAfterLogin = (user: { displayName?: string | null; characterType?: string | null }) => {
    if (!user.displayName || !user.characterType) {
      router.replace('/(auth)/setup');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading('apple');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { data } = await authApi.loginApple(credential.identityToken);
        const result = data.data;
        await setTokens(result.accessToken, result.refreshToken);
        await SecureStore.setItemAsync(Config.USER_KEY, JSON.stringify(result.user));
        setUser(result.user);
        routeAfterLogin(result.user);
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('로그인 실패', 'Apple 로그인에 실패했습니다.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setLoading('kakao');
      let kakaoToken: string;
      try {
        const { login } = require('@react-native-seoul/kakao-login');
        const result = await login();
        kakaoToken = result.accessToken;
      } catch {
        Alert.alert(
          '카카오 로그인',
          'Expo Go에서는 카카오 로그인을 사용할 수 없습니다.\n네이티브 빌드에서 테스트해주세요.',
        );
        return;
      }

      const { data } = await authApi.loginKakao(kakaoToken);
      const result = data.data;
      await setTokens(result.accessToken, result.refreshToken);
      await SecureStore.setItemAsync(Config.USER_KEY, JSON.stringify(result.user));
      setUser(result.user);
      routeAfterLogin(result.user);
    } catch (e: any) {
      console.error('카카오 로그인 에러:', e?.response?.data || e?.message || e);
      const detail = e?.response?.data?.error?.message || e?.message || '알 수 없는 오류';
      Alert.alert('로그인 실패', `카카오 로그인에 실패했습니다.\n${detail}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단: 심볼 + 로고 + 슬로건 */}
      <View style={styles.top}>
        <View style={styles.symbolWrap}>
          <PotSymbol size={88} />
        </View>
        <PicookLogo size={36} />
        <Text style={styles.slogan}>오늘 <Text style={styles.sloganAccent}>뭐</Text> 먹지?</Text>
        <Text style={styles.sloganSub}>냉장고 속 재료를 알려주세요!</Text>
      </View>

      {/* 하단: Apple/Kakao 버튼 + 약관 */}
      <View style={styles.auth}>
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.authBtn, styles.apple]}
            onPress={handleAppleLogin}
            disabled={loading !== null}
            activeOpacity={0.85}
          >
            {loading === 'apple' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <AppleLogo />
                <Text style={[styles.authText, styles.appleText]}>Apple로 계속하기</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.authBtn, styles.kakao]}
          onPress={handleKakaoLogin}
          disabled={loading !== null}
          activeOpacity={0.85}
        >
          {loading === 'kakao' ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <>
              <KakaoLogo />
              <Text style={[styles.authText, styles.kakaoText]}>카카오로 계속하기</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          계속 진행하면 <Text style={styles.termsLink}>이용약관</Text>과{' '}
          <Text style={styles.termsLink}>개인정보처리방침</Text>에{'\n'}
          동의한 것으로 간주됩니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function AppleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill="#FFFFFF"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </Svg>
  );
}

function KakaoLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill="#1A1A1A"
        d="M12 3C6.48 3 2 6.58 2 11c0 2.89 1.92 5.41 4.81 6.8-.21.72-.77 2.62-.88 3.03-.14.51.19.5.4.37.16-.11 2.54-1.73 3.56-2.42.69.1 1.39.15 2.11.15 5.52 0 10-3.58 10-8S17.52 3 12 3z"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingTop: 40,
    paddingBottom: 20,
  },
  symbolWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C4642E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  slogan: {
    ...typography.heroTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 10,
  },
  sloganAccent: {
    color: colors.primary,
  },
  sloganSub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: -2,
  },
  auth: {
    paddingBottom: 36,
    paddingTop: 16,
    gap: 10,
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 14,
  },
  apple: {
    backgroundColor: '#000000',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  authText: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  appleText: {
    color: '#FFFFFF',
  },
  kakaoText: {
    color: '#1A1A1A',
  },
  terms: {
    ...typography.meta,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
  termsLink: {
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
