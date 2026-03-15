import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../src/constants/colors';
import { useAuthStore } from '../../../src/stores/authStore';
import { authApi } from '../../../src/api/authApi';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          try {
            await authApi.logout();
          } catch {
            // ignore
          }
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>앱 설정</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Linking.openURL('https://picook.com/terms')}
        >
          <Text style={styles.menuLabel}>이용약관</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Linking.openURL('https://picook.com/privacy')}
        >
          <Text style={styles.menuLabel}>개인정보 처리방침</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.menuItem}>
          <Text style={styles.menuLabel}>앱 버전</Text>
          <Text style={styles.menuVersion}>1.0.0</Text>
        </View>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
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
  menu: {
    margin: 20, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.borderLight, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  menuLabel: { fontSize: 16, color: Colors.text },
  menuArrow: { fontSize: 20, color: Colors.textTertiary },
  menuVersion: { fontSize: 15, color: Colors.textTertiary },
  logoutSection: { padding: 20 },
  logoutBtn: {
    paddingVertical: 16, alignItems: 'center',
    borderRadius: 12, borderWidth: 1, borderColor: Colors.error,
  },
  logoutText: { fontSize: 16, color: Colors.error, fontWeight: '600' },
});
