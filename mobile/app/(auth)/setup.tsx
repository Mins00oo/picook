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
import { CHARACTERS, getCharacterName } from '../../src/constants/characters';
import type { CharacterType } from '../../src/types/user';

export default function SetupScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [selectedChar, setSelectedChar] = useState<CharacterType>(user?.characterType ?? 'EGG');
  const [nickname, setNickname] = useState(user?.displayName ?? '');
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  const nicknameValid = nickname.trim().length >= 2 && nickname.trim().length <= 10;
  const canSubmit = !!selectedChar && nicknameValid && !saving;

  const helperText = useMemo(() => {
    if (!nickname) return '2~10자로 입력해주세요';
    if (nickname.trim().length < 2) return '2자 이상 입력해주세요';
    if (nickname.trim().length > 10) return '10자 이내로 입력해주세요';
    return '사용할 수 있는 닉네임이에요';
  }, [nickname]);

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
    } catch {
      Alert.alert('오류', '설정 저장에 실패했습니다. 다시 시도해주세요.');
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
              시작해볼까요?{'\n'}나만의 <Text style={styles.headAccent}>친구</Text>를 골라주세요.
            </Text>
            <Text style={styles.headDesc}>언제든 마이페이지에서 바꿀 수 있어요.</Text>
          </View>

          {/* 캐릭터 셀렉터 */}
          <View style={styles.selector}>
            <View style={styles.selectorLabelRow}>
              <Text style={styles.fieldLabel}>캐릭터</Text>
              <Text style={styles.selName}>{getCharacterName(selectedChar)} 선택됨</Text>
            </View>
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
                      <Character type={c.type} size={72} />
                    </View>
                    <Text style={styles.charName}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 닉네임 */}
          <View style={styles.nickArea}>
            <View style={styles.selectorLabelRow}>
              <Text style={styles.fieldLabel}>닉네임</Text>
              {nicknameValid && (
                <Text style={[styles.selName, { color: colors.success }]}>사용 가능</Text>
              )}
            </View>
            <View style={[styles.nickField, focused && styles.nickFieldFocus]}>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="닉네임을 입력해주세요"
                placeholderTextColor={colors.textTertiary}
                maxLength={10}
                style={styles.nickInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Text style={styles.counter}>{nickname.length}/10</Text>
              {nicknameValid && (
                <View style={styles.nickCheck}>
                  <Svg width={16} height={16} viewBox="0 0 24 24">
                    <Path
                      d="M5 12l5 5L20 7"
                      stroke={colors.success}
                      strokeWidth={3}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
                </View>
              )}
            </View>
            <View style={styles.helperRow}>
              {nicknameValid && (
                <Svg width={11} height={11} viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                  <Path
                    d="M5 12l5 5L20 7"
                    stroke={colors.success}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              )}
              <Text
                style={[
                  styles.helper,
                  nicknameValid && { color: colors.success, fontFamily: fontFamily.semibold },
                ]}
              >
                {helperText}
              </Text>
            </View>
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
    aspectRatio: 1 / 1.1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
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
    width: 72,
    height: 72,
    marginBottom: 4,
  },
  charName: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
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
