import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { useAuthStore } from '../../../src/stores/authStore';
import { getLevelForCount } from '../../../src/constants/levels';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const level = getLevelForCount(user?.completedCount ?? 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              안녕하세요{user?.nickname ? `, ${user.nickname}님` : ''} 👋
            </Text>
            <Text style={styles.levelBadge}>
              {level.emoji} {level.title}
            </Text>
          </View>
        </View>

        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>오늘 뭐 먹지? 🤔</Text>
          <Text style={styles.ctaDesc}>
            냉장고 재료를 선택하면{'\n'}맞춤 레시피를 추천해드려요
          </Text>
          <Button
            title="재료 선택하기"
            onPress={() => router.push('/(tabs)/home/select')}
            size="large"
            style={styles.ctaButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 검색</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>아직 검색 기록이 없어요</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 레시피</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>레시피를 불러오는 중...</Text>
          </View>
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
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  levelBadge: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ctaCard: {
    backgroundColor: '#FFF5F0',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  ctaDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  ctaButton: {
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
});
