import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../src/constants/colors';
import { Button } from '../../src/components/common/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { userApi } from '../../src/api/userApi';
import { Config } from '../../src/constants/config';
import type { CookingLevel } from '../../src/types/user';

const LEVELS: { value: CookingLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'BEGINNER', label: '입문', desc: '요리 경험이 거의 없어요', emoji: '🐣' },
  { value: 'EASY', label: '초급', desc: '간단한 요리는 할 수 있어요', emoji: '🍳' },
  { value: 'INTERMEDIATE', label: '중급', desc: '다양한 요리를 즐겨요', emoji: '👨‍🍳' },
  { value: 'ADVANCED', label: '고급', desc: '전문 수준의 요리 실력이에요', emoji: '⭐' },
];

const SPEEDS = [
  { value: 0.8, label: '느리게' },
  { value: 1.0, label: '보통' },
  { value: 1.2, label: '빠르게' },
];

export default function SetupScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [cookingLevel, setCookingLevel] = useState<CookingLevel | null>(null);
  const [coachingEnabled, setCoachingEnabled] = useState(true);
  const [coachingSpeed, setCoachingSpeed] = useState(1.0);
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (!cookingLevel) {
      Alert.alert('알림', '요리 실력을 선택해주세요.');
      return;
    }
    // 입문/초급이면 코칭 기본 ON
    if (cookingLevel === 'BEGINNER' || cookingLevel === 'EASY') {
      setCoachingEnabled(true);
    }
    setStep(2);
  };

  const handleComplete = async () => {
    if (!cookingLevel) return;
    setSaving(true);
    try {
      const { data } = await userApi.updateMe({
        cookingLevel,
        coachingEnabled,
        coachingSpeed,
      });
      const user = data.data;
      setUser(user);
      await SecureStore.setItemAsync(Config.USER_KEY, JSON.stringify(user));
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('오류', '설정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.stepText}>1 / 2</Text>
          <Text style={styles.title}>요리 실력을 알려주세요</Text>
          <Text style={styles.subtitle}>맞춤 추천을 위해 필요해요</Text>
        </View>

        <View style={styles.cards}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.card,
                cookingLevel === level.value && styles.cardSelected,
              ]}
              onPress={() => setCookingLevel(level.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardEmoji}>{level.emoji}</Text>
              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.cardLabel,
                    cookingLevel === level.value && styles.cardLabelSelected,
                  ]}
                >
                  {level.label}
                </Text>
                <Text style={styles.cardDesc}>{level.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="다음"
            onPress={handleNext}
            disabled={!cookingLevel}
            size="large"
            style={styles.fullButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>2 / 2</Text>
        <Text style={styles.title}>음성 코칭 설정</Text>
        <Text style={styles.subtitle}>
          요리할 때 음성으로 안내받을 수 있어요
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>음성 코칭</Text>
            <Text style={styles.settingDesc}>
              단계별로 음성으로 안내해드려요
            </Text>
          </View>
          <Switch
            value={coachingEnabled}
            onValueChange={setCoachingEnabled}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={coachingEnabled ? Colors.primary : Colors.textTertiary}
          />
        </View>

        {coachingEnabled && (
          <View style={styles.speedSection}>
            <Text style={styles.settingLabel}>음성 속도</Text>
            <View style={styles.speedButtons}>
              {SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed.value}
                  style={[
                    styles.speedButton,
                    coachingSpeed === speed.value && styles.speedButtonSelected,
                  ]}
                  onPress={() => setCoachingSpeed(speed.value)}
                >
                  <Text
                    style={[
                      styles.speedText,
                      coachingSpeed === speed.value && styles.speedTextSelected,
                    ]}
                  >
                    {speed.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="시작하기"
          onPress={handleComplete}
          loading={saving}
          size="large"
          style={styles.fullButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  stepText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  cards: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 16,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F0',
  },
  cardEmoji: {
    fontSize: 36,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  cardLabelSelected: {
    color: Colors.primary,
  },
  cardDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingsSection: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  speedSection: {
    gap: 12,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  speedButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  speedButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F0',
  },
  speedText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  speedTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  fullButton: {
    width: '100%',
  },
});
