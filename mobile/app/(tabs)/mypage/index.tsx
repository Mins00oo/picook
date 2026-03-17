import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../src/constants/colors';
import { useAuthStore } from '../../../src/stores/authStore';
import { getLevelForCount, getLevelProgress, getNextLevel } from '../../../src/constants/levels';

export default function MypageScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const count = user?.completedCookingCount ?? 0;
  const level = getLevelForCount(count);
  const nextLevel = getNextLevel(level);
  const progress = getLevelProgress(count);

  const MENU_ITEMS = [
    { label: '프로필 수정', route: '/(tabs)/mypage/profile' as const },
    { label: '코칭 설정', route: '/(tabs)/mypage/coaching-settings' as const },
    { label: '앱 설정', route: '/(tabs)/mypage/settings' as const },
    { label: '회원 탈퇴', route: '/(tabs)/mypage/delete-account' as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>마이페이지</Text>

        <View style={styles.profileCard}>
          <Text style={styles.profileEmoji}>{level.emoji}</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{user?.displayName ?? '사용자'}</Text>
            <Text style={styles.levelText}>
              Lv.{level.level} {level.title}
            </Text>
          </View>
        </View>

        <View style={styles.rankCard}>
          <View style={styles.rankHeader}>
            <Text style={styles.rankTitle}>요리 등급</Text>
            <Text style={styles.rankCount}>{count}회 완료</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.rankDesc}>
            {nextLevel
              ? `다음 등급까지 ${nextLevel.min - count}회 남았어요`
              : '최고 등급 달성!'}
          </Text>
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  profileEmoji: {
    fontSize: 48,
  },
  profileInfo: {
    gap: 4,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  levelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rankCard: {
    padding: 20,
    backgroundColor: '#FFF5F0',
    borderRadius: 16,
    gap: 12,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  rankCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  rankDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menu: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textTertiary,
  },
});
