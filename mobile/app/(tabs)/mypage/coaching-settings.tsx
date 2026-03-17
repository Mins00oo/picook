import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { useAuthStore } from '../../../src/stores/authStore';
import { userApi } from '../../../src/api/userApi';
import { Config } from '../../../src/constants/config';

const SPEEDS = [
  { value: 0.8, label: '느리게' },
  { value: 1.0, label: '보통' },
  { value: 1.2, label: '빠르게' },
];

export default function CoachingSettingsScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [coachingEnabled, setCoachingEnabled] = useState(user?.coachingEnabled ?? true);
  const [coachingSpeed, setCoachingSpeed] = useState(user?.coachingVoiceSpeed ?? 1.0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userApi.updateMe({ coachingEnabled, coachingVoiceSpeed: coachingSpeed });
      setUser(data.data);
      await SecureStore.setItemAsync(Config.USER_KEY, JSON.stringify(data.data));
      Alert.alert('완료', '코칭 설정이 저장되었습니다.');
      router.back();
    } catch {
      Alert.alert('오류', '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>코칭 설정</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>음성 코칭</Text>
            <Text style={styles.settingDesc}>단계별로 음성으로 안내해드려요</Text>
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
            <View style={styles.speedRow}>
              {SPEEDS.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.speedBtn,
                    coachingSpeed === s.value && styles.speedBtnActive,
                  ]}
                  onPress={() => setCoachingSpeed(s.value)}
                >
                  <Text
                    style={[
                      styles.speedText,
                      coachingSpeed === s.value && styles.speedTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="저장"
          onPress={handleSave}
          loading={saving}
          size="large"
          style={styles.saveBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12,
  },
  back: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  content: { flex: 1, padding: 20, gap: 24 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  settingLabel: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  settingDesc: { fontSize: 13, color: Colors.textSecondary },
  speedSection: { gap: 12 },
  speedRow: { flexDirection: 'row', gap: 10 },
  speedBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  speedBtnActive: { borderColor: Colors.primary, backgroundColor: '#FFF5F0' },
  speedText: { fontSize: 15, fontWeight: '500', color: Colors.textSecondary },
  speedTextActive: { color: Colors.primary, fontWeight: '600' },
  footer: { paddingHorizontal: 20, paddingBottom: 20 },
  saveBtn: { width: '100%' },
});
