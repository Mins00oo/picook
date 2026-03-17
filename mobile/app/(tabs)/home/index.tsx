import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadow } from '../../../src/constants/theme';
import { Button } from '../../../src/components/common/Button';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { useAuthStore } from '../../../src/stores/authStore';
import { getLevelForCount, getNextLevel, getLevelProgress } from '../../../src/constants/levels';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const level = getLevelForCount(user?.completedCookingCount ?? 0);
  const nextLevel = getNextLevel(level);
  const progress = getLevelProgress(user?.completedCookingCount ?? 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header: 인사 + 등급 뱃지 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              안녕하세요{user?.displayName ? `, ${user.displayName}님` : ''} 👋
            </Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankEmoji}>{level.emoji}</Text>
            <Text style={styles.rankTitle}>{level.title}</Text>
          </View>
        </View>

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaEmoji}>🍳</Text>
            <View style={styles.ctaTextArea}>
              <Text style={styles.ctaTitle}>오늘 뭐 먹지?</Text>
              <Text style={styles.ctaDesc}>
                냉장고 재료를 선택하면{'\n'}맞춤 레시피를 추천해드려요
              </Text>
            </View>
          </View>
          <Button
            title="재료 선택하기"
            onPress={() => router.push('/(tabs)/home/select')}
            size="medium"
            style={styles.ctaButton}
          />
        </View>

        {/* 등급 카드 */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Lv.{level.level} {level.title}</Text>
              {nextLevel ? (
                <Text style={styles.levelNext}>
                  다음 레벨까지 {nextLevel.min - (user?.completedCookingCount ?? 0)}개
                </Text>
              ) : (
                <Text style={styles.levelNext}>최고 레벨 달성!</Text>
              )}
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* 최근 검색 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 검색</Text>
          <EmptyState
            emoji="🔍"
            title="아직 검색 기록이 없어요"
            description="재료를 선택하면 여기에 표시돼요"
          />
        </View>

        {/* 인기 레시피 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 레시피</Text>
          <EmptyState
            emoji="🍽️"
            title="인기 레시피가 아직 없어요"
            description="첫 번째 레시피를 찾아보세요"
            actionLabel="레시피 찾기"
            onAction={() => router.push('/(tabs)/home/select')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  rankEmoji: {
    fontSize: 16,
  },
  rankTitle: {
    ...typography.small,
    fontWeight: '600',
    color: colors.primary,
  },
  // CTA
  ctaCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.sm,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ctaEmoji: {
    fontSize: 40,
  },
  ctaTextArea: {
    flex: 1,
    gap: 4,
  },
  ctaTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  ctaDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: borderRadius.lg,
  },
  // Level Card
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.sm,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelEmoji: {
    fontSize: 32,
  },
  levelInfo: {
    flex: 1,
    gap: 2,
  },
  levelTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  levelNext: {
    ...typography.small,
    color: colors.textTertiary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  // Section
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
});
