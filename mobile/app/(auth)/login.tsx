import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../src/constants/colors';
import { Button } from '../../src/components/common/Button';
import { Config } from '../../src/constants/config';
import { useAuthStore } from '../../src/stores/authStore';
import { authApi } from '../../src/api/authApi';

export default function LoginScreen() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [loading, setLoading] = useState<'apple' | 'kakao' | null>(null);

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

        if (!result.user.cookingLevel) {
          router.replace('/(auth)/setup');
        } else {
          router.replace('/(tabs)/home');
        }
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

      // @react-native-seoul/kakao-login은 Expo Go에서 동작하지 않음
      // 네이티브 빌드에서만 사용 가능
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

      if (!result.user.cookingLevel) {
        router.replace('/(auth)/setup');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch {
      Alert.alert('로그인 실패', '카카오 로그인에 실패했습니다.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🍳</Text>
        <Text style={styles.title}>Picook</Text>
        <Text style={styles.subtitle}>냉장고 재료로 만드는{'\n'}나만의 레시피</Text>
      </View>

      <View style={styles.buttons}>
        <Button
          title="카카오로 시작하기"
          onPress={handleKakaoLogin}
          loading={loading === 'kakao'}
          disabled={loading !== null}
          style={styles.kakaoButton}
          textStyle={styles.kakaoText}
          size="large"
        />

        {Platform.OS === 'ios' && (
          <Button
            title="Apple로 시작하기"
            onPress={handleAppleLogin}
            loading={loading === 'apple'}
            disabled={loading !== null}
            style={styles.appleButton}
            textStyle={styles.appleText}
            size="large"
          />
        )}

        <Text style={styles.terms}>
          시작하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주합니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttons: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  kakaoButton: {
    backgroundColor: Colors.kakaoYellow,
    width: '100%',
  },
  kakaoText: {
    color: Colors.kakaoBrown,
  },
  appleButton: {
    backgroundColor: Colors.appleBg,
    width: '100%',
  },
  appleText: {
    color: Colors.white,
  },
  terms: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
