import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadow,
  getIngredientEmoji,
} from '../../../src/constants/theme';
import { Button } from '../../../src/components/common/Button';
import { useSelectionStore } from '../../../src/stores/selectionStore';
import { useFilterStore } from '../../../src/stores/filterStore';
import { ingredientApi } from '../../../src/api/ingredientApi';
import type { Difficulty } from '../../../src/types/recipe';

const TIME_OPTIONS = [
  { label: '전체', value: null },
  { label: '15분 이내', value: 15, icon: '⚡' },
  { label: '30분 이내', value: 30, icon: '⏱️' },
  { label: '1시간 이내', value: 60, icon: '🕐' },
];

const DIFFICULTY_OPTIONS: { label: string; value: Difficulty | null; icon?: string }[] = [
  { label: '전체', value: null },
  { label: '쉬움', value: 'EASY', icon: '😊' },
  { label: '보통', value: 'MEDIUM', icon: '👨‍🍳' },
  { label: '어려움', value: 'HARD', icon: '🔥' },
];

const SERVINGS_OPTIONS = [
  { label: '전체', value: null },
  { label: '1인분', value: 1, icon: '👤' },
  { label: '2인분', value: 2, icon: '👥' },
  { label: '3-4인분', value: 4, icon: '👨‍👩‍👦' },
];

export default function ConfirmScreen() {
  const router = useRouter();
  const { getIds, remove, count } = useSelectionStore();
  const {
    maxCookTimeMinutes, difficulty, servings,
    setMaxCookTime, setDifficulty, setServings,
  } = useFilterStore();

  const selectedIds = getIds();

  const { data: ingredientsData } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const res = await ingredientApi.getAll();
      return res.data.data;
    },
  });

  const selectedIngredients = useMemo(
    () => (ingredientsData ?? []).filter((ing) => selectedIds.includes(ing.id)),
    [ingredientsData, selectedIds],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>추천 전 확인</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 선택 재료 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧺 선택한 재료</Text>
            <Text style={styles.sectionCount}>{count()}개</Text>
          </View>
          <View style={styles.chipRow}>
            {selectedIngredients.map((ing) => (
              <TouchableOpacity
                key={ing.id}
                style={styles.ingredientChip}
                onPress={() => remove(ing.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipEmoji}>{getIngredientEmoji(ing.name)}</Text>
                <Text style={styles.chipText}>{ing.name}</Text>
                <Text style={styles.chipX}>✕</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addChip}
              onPress={() => router.back()}
            >
              <Text style={styles.addChipText}>+ 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 조리 시간 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ 조리 시간</Text>
          <View style={styles.filterRow}>
            {TIME_OPTIONS.map((opt) => {
              const active = maxCookTimeMinutes === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.filterBtn, active && styles.filterBtnActive]}
                  onPress={() => setMaxCookTime(opt.value)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 난이도 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 난이도</Text>
          <View style={styles.filterRow}>
            {DIFFICULTY_OPTIONS.map((opt) => {
              const active = difficulty === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.filterBtn, active && styles.filterBtnActive]}
                  onPress={() => setDifficulty(opt.value)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 인분 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 인분</Text>
          <View style={styles.filterRow}>
            {SERVINGS_OPTIONS.map((opt) => {
              const active = servings === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.filterBtn, active && styles.filterBtnActive]}
                  onPress={() => setServings(opt.value)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 안내 */}
        <View style={styles.guideCard}>
          <Text style={styles.guideEmoji}>🍳</Text>
          <Text style={styles.guideText}>
            선택한 조건으로 맞춤 레시피를 찾아드려요
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="레시피 추천받기"
          onPress={() => router.push('/(tabs)/home/results')}
          disabled={count() === 0}
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
    backgroundColor: colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  backIcon: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  // Content
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Section
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  // Ingredient chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    gap: 4,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  chipX: {
    fontSize: 12,
    color: colors.primary,
    opacity: 0.6,
    marginLeft: 2,
  },
  addChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  addChipText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  // Guide
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  guideEmoji: {
    fontSize: 24,
  },
  guideText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '500',
  },
  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    ...shadow.md,
  },
  fullButton: {
    width: '100%',
  },
});
