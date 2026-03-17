import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { useAuthStore } from '../../../src/stores/authStore';
import { authApi } from '../../../src/api/authApi';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      '회원 탈퇴',
      '탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await authApi.deleteAccount();
              queryClient.clear();
              await logout();
              router.replace('/(auth)/login');
            } catch {
              Alert.alert('오류', '탈퇴 처리에 실패했습니다.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>회원 탈퇴</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.warningEmoji}>⚠️</Text>
        <Text style={styles.warningTitle}>정말 떠나시려구요?</Text>
        <Text style={styles.warningDesc}>
          탈퇴하면 아래 데이터가 모두 삭제됩니다.{'\n'}
          {'\n'}• 프로필 정보{'\n'}• 즐겨찾기{'\n'}• 요리 기록 및 등급{'\n'}• 쇼츠 변환 기록
          {'\n\n'}삭제된 데이터는 복구할 수 없습니다.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="회원 탈퇴"
          onPress={handleDelete}
          loading={loading}
          style={styles.deleteBtn}
          textStyle={styles.deleteBtnText}
          size="large"
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
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 12,
  },
  warningEmoji: { fontSize: 56, marginBottom: 8 },
  warningTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  warningDesc: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  deleteBtn: { width: '100%', backgroundColor: Colors.error },
  deleteBtnText: { color: Colors.white },
});
