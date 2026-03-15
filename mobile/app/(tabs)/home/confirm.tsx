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
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { useSelectionStore } from '../../../src/stores/selectionStore';
import { useFilterStore } from '../../../src/stores/filterStore';
import { ingredientApi } from '../../../src/api/ingredientApi';
import type { Difficulty } from '../../../src/types/recipe';

const TIME_OPTIONS = [
  { label: '전체', value: null },
  { label: '15분 이내', value: 15 },
  { label: '30분 이내', value: 30 },
  { label: '1시간 이내', value: 60 },
];

const DIFFICULTY_OPTIONS: { label: string; value: Difficulty | null }[] = [
  { label: '전체', value: null },
  { label: '쉬움', value: 'EASY' },
  { label: '보통', value: 'MEDIUM' },
  { label: '어려움', value: 'HARD' },
];

const SERVINGS_OPTIONS = [
  { label: '전체', value: null },
  { label: '1인분', value: 1 },
  { label: '2인분', value: 2 },
  { label: '3-4인분', value: 4 },
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>추천 전 확인</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>선택한 재료 ({count()}개)</Text>
          <View style={styles.chipRow}>
            {selectedIngredients.map((ing) => (
              <TouchableOpacity
                key={ing.id}
                style={styles.chip}
                onPress={() => remove(ing.id)}
              >
                <Text style={styles.chipText}>{ing.name} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>조리 시간</Text>
          <View style={styles.filterRow}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  styles.filterBtn,
                  maxCookTimeMinutes === opt.value && styles.filterBtnActive,
                ]}
                onPress={() => setMaxCookTime(opt.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    maxCookTimeMinutes === opt.value && styles.filterTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>난이도</Text>
          <View style={styles.filterRow}>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  styles.filterBtn,
                  difficulty === opt.value && styles.filterBtnActive,
                ]}
                onPress={() => setDifficulty(opt.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    difficulty === opt.value && styles.filterTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인분</Text>
          <View style={styles.filterRow}>
            {SERVINGS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  styles.filterBtn,
                  servings === opt.value && styles.filterBtnActive,
                ]}
                onPress={() => setServings(opt.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    servings === opt.value && styles.filterTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    padding: 20,
    gap: 28,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  filterBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F0',
  },
  filterText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  fullButton: {
    width: '100%',
  },
});
