import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, borderRadius, shadow, fontFamily } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { userApi } from '../../src/api/userApi';
import { Config } from '../../src/constants/config';
import { Character } from '../../src/components/brand/Character';
import { CHARACTERS } from '../../src/constants/characters';
import type { CharacterType } from '../../src/types/user';

export default function SetupScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [selectedChar, setSelectedChar] = useState<CharacterType>(user?.characterType ?? 'MIN');
  // setup 진입은 신규 가입자(=displayName 미설정)만 허용되므로 빈칸으로 시작.
  const [nickname, setNickname] = useState(user?.displayName ?? '');
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  // 백엔드가 이미 사용 중이라고 거절한 닉네임. 그 이름 그대로일 때만 에러 표시.
  const [takenName, setTakenName] = useState<string | null>(null);

  const trimmed = nickname.trim();
  // 한글(완성형·자모)·영문·숫자·밑줄만 2~10자. 공백/이모지/특수문자 차단.
  const NICK_REGEX = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9_]{2,10}$/;
  const lengthValid = trimmed.length >= 2 && trimmed.length <= 10;
  const formatValid = NICK_REGEX.test(trimmed);
  const isTaken = takenName != null && trimmed === takenName;
  const canSubmit = !!selectedChar && formatValid && !saving && !isTaken;
  const hasFormatError = lengthValid && !formatValid;

  const helperText = useMemo(() => {
    if (!nickname) return '2~10자로 입력해주세요';
    if (trimmed.length < 2) return '2자 이상 입력해주세요';
    if (trimmed.length > 10) return '10자 이내로 입력해주세요';
    if (hasFormatError) return '한글·영문·숫자·밑줄(_)만 사용할 수 있어요';
    if (isTaken) return '이미 사용 중인 닉네임이에요';
    return '이 이름으로 시작해볼까요?';
  }, [nickname, trimmed, hasFormatError, isTaken]);

  const handleComplete = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const { data } = await userApi.updateMe({
        displayName: nickname.trim(),
        characterType: selectedChar,
      });
      const updatedUser = data.data;
      await SecureStore.setItemAsync(Config.USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      const code = e?.response?.data?.error?.code;
      if (code === 'DISPLAY_NAME_TAKEN') {
        // 백엔드 uq_users_display_name 제약 충돌 → 이 이름 안 됨
        setTakenName(trimmed);
        // helperText가 '이미 사용 중인 닉네임이에요'로 바뀌고 CTA 비활성화됨
      } else {
        Alert.alert('오류', '설정 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress bar 2/2 */}
          <View style={styles.progressNav}>
            <Text style={styles.stepText}>
              <Text style={styles.stepAccent}>2</Text>
              <Text> / 2</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>

          {/* 헤더 */}
          <View style={styles.head}>
            <Text style={styles.headTitle}>
              함께 요리할{'\n'}<Text style={styles.headAccent}>캐릭터</Text>를 골라주세요.
            </Text>
            <Text style={styles.headDesc}>
              캐릭터와 닉네임 모두 언제든 마이페이지에서 바꿀 수 있어요.
            </Text>
          </View>

          {/* 캐릭터 셀렉터 */}
          <View style={styles.selector}>
            <View style={styles.charGrid}>
              {CHARACTERS.map((c) => {
                const isSel = selectedChar === c.type;
                return (
                  <TouchableOpacity
                    key={c.type}
                    style={[styles.charCard, isSel && styles.charCardSelected]}
                    onPress={() => setSelectedChar(c.type)}
                    activeOpacity={0.8}
                  >
                    {isSel && (
                      <View style={styles.check}>
                        <Svg width={11} height={11} viewBox="0 0 24 24">
                          <Path
                            d="M5 12l5 5L20 7"
                            stroke="#fff"
                            strokeWidth={3.5}
                            strokeLinecap="round"
                            fill="none"
                          />
                        </Svg>
                      </View>
                    )}
                    <View style={styles.charArt}>
                      <Character type={c.type} size={84} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 닉네임 */}
          <View style={styles.nickArea}>
            <View style={styles.selectorLabelRow}>
              <Text style={styles.fieldLabel}>닉네임</Text>
              {isTaken ? (
                <Text style={[styles.selName, { color: colors.error }]}>사용 중</Text>
              ) : hasFormatError ? (
                <Text style={[styles.selName, { color: colors.error }]}>허용되지 않는 문자</Text>
              ) : null}
            </View>
            <View
              style={[
                styles.nickField,
                focused && styles.nickFieldFocus,
                (isTaken || hasFormatError) && styles.nickFieldError,
              ]}
            >
              <TextInput
                value={nickname}
                onChangeText={(t) => {
                  setNickname(t);
                  // 다른 이름으로 수정되면 takenName 매칭 자동 해제 → isTaken false
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={user?.oauthName ? `예: ${user.oauthName}` : '닉네임을 입력해주세요'}
                placeholderTextColor={colors.textTertiary}
                maxLength={10}
                style={styles.nickInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Text style={styles.counter}>{nickname.length}/10</Text>
              {(isTaken || hasFormatError) && (
                <View style={styles.nickCheck}>
                  <Svg width={14} height={14} viewBox="0 0 24 24">
                    <Path d="M6 6l12 12M6 18L18 6" stroke={colors.error} strokeWidth={2.5} strokeLinecap="round" />
                  </Svg>
                </View>
              )}
            </View>
            <View style={styles.helperRow}>
              {(isTaken || hasFormatError) && (
                <Svg width={11} height={11} viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                  <Path d="M6 6l12 12M6 18L18 6" stroke={colors.error} strokeWidth={2.5} strokeLinecap="round" />
                </Svg>
              )}
              <Text
                style={[
                  styles.helper,
                  (isTaken || hasFormatError) && { color: colors.error, fontFamily: fontFamily.semibold },
                ]}
              >
                {helperText}
              </Text>
            </View>
            <Text style={styles.nickFootnote}>
              닉네임은 언제든 마이페이지에서 바꿀 수 있어요
            </Text>
          </View>
        </ScrollView>

        {/* 하단 고정 CTA */}
        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom + 8, 28) }]}>
          <TouchableOpacity
            style={[styles.cta, !canSubmit && styles.ctaDisabled]}
            onPress={handleComplete}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{saving ? '저장 중...' : '시작하기'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  // Progress
  progressNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  stepText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
  },
  stepAccent: {
    color: colors.primary,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 100,
    overflow: 'hidden',
    marginLeft: 8,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 100,
  },
  // Head
  head: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headTitle: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 34,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  headAccent: {
    color: colors.primary,
  },
  headDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Selector
  selector: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectorLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldLabel: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
  },
  selName: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontFamily: fontFamily.semibold,
  },
  charGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  charCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    overflow: 'hidden',
  },
  charCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.accentSoft,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  charArt: {
    width: 84,
    height: 84,
  },
  // Nickname
  nickArea: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  nickField: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nickFieldFocus: {
    borderColor: colors.primary,
  },
  nickFieldError: {
    borderColor: colors.error,
  },
  nickInput: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    padding: 0,
  },
  counter: {
    ...typography.meta,
    color: colors.textTertiary,
    fontFamily: fontFamily.medium,
  },
  nickCheck: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  helper: {
    ...typography.meta,
    fontSize: 11.5,
    color: colors.textTertiary,
  },
  nickFootnote: {
    ...typography.meta,
    fontSize: 10.5,
    color: colors.textTertiary,
    marginTop: 10,
    paddingLeft: 4,
    fontFamily: fontFamily.medium,
  },
  // Bottom CTA
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  cta: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.cta,
  },
  ctaDisabled: {
    backgroundColor: '#D4C6BC',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
  },
});
