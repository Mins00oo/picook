import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { useAuthStore } from '../../../src/stores/authStore';
import { userApi } from '../../../src/api/userApi';
import { Config } from '../../../src/constants/config';
import { Character } from '../../../src/components/brand/Character';
import { CHARACTERS, getCharacterName } from '../../../src/constants/characters';
import type { CharacterType } from '../../../src/types/user';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [nickname, setNickname] = useState(user?.displayName ?? '');
  const [characterType, setCharacterType] = useState<CharacterType>(
    (user?.characterType ?? 'MIN') as CharacterType,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await userApi.updateMe({
        displayName: nickname.trim(),
        characterType,
      });
      setUser(data.data);
      await SecureStore.setItemAsync(Config.USER_KEY, JSON.stringify(data.data));
      Alert.alert('완료', '프로필이 수정되었습니다.');
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
        <Text style={styles.title}>프로필 수정</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            maxLength={10}
            placeholder="2~10자로 입력하세요"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            캐릭터 <Text style={{ fontSize: 12, color: Colors.textSecondary }}>· {getCharacterName(characterType)}</Text>
          </Text>
          <View style={styles.charRow}>
            {CHARACTERS.map((c) => {
              const isSel = characterType === c.type;
              return (
                <TouchableOpacity
                  key={c.type}
                  style={[styles.charCard, isSel && styles.charCardActive]}
                  onPress={() => setCharacterType(c.type)}
                  activeOpacity={0.8}
                >
                  <Character type={c.type} size={52} />
                  <Text style={[styles.charName, isSel && styles.charNameActive]}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  content: { flex: 1, padding: 20, gap: 24 },
  field: { gap: 10 },
  label: { fontSize: 15, fontWeight: '600', color: Colors.text },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  charRow: { flexDirection: 'row', gap: 8 },
  charCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    gap: 4,
  },
  charCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFEDE4',
    borderWidth: 2,
  },
  charName: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  charNameActive: { color: Colors.primary, fontWeight: '700' },
  footer: { paddingHorizontal: 20, paddingBottom: 20 },
  saveBtn: { width: '100%' },
});
