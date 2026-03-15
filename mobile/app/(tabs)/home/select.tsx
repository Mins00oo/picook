import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { ingredientApi } from '../../../src/api/ingredientApi';
import { useSelectionStore } from '../../../src/stores/selectionStore';
import { searchIngredients } from '../../../src/utils/search';
import type { Ingredient, IngredientCategory } from '../../../src/types/ingredient';

export default function SelectScreen() {
  const router = useRouter();
  const { selectedIds, toggle, count, clear } = useSelectionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const { data: categoriesData, isLoading: catLoading } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: async () => {
      const res = await ingredientApi.getCategories();
      return res.data.data;
    },
  });

  const { data: ingredientsData, isLoading: ingLoading, error, refetch } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const res = await ingredientApi.getAll();
      return res.data.data;
    },
  });

  const categories = categoriesData ?? [];
  const ingredients = ingredientsData ?? [];

  const filteredIngredients = useMemo(() => {
    let list = ingredients;
    if (activeCategory !== null) {
      list = list.filter((ing) => ing.categoryId === activeCategory);
    }
    if (searchQuery.trim()) {
      list = searchIngredients(searchQuery, list);
    }
    return list;
  }, [ingredients, activeCategory, searchQuery]);

  const handleToggle = useCallback((id: number) => toggle(id), [toggle]);

  if (catLoading || ingLoading) return <Loading message="재료를 불러오는 중..." />;
  if (error) return <ErrorScreen message="재료 로드에 실패했습니다" onRetry={() => refetch()} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>재료 선택</Text>
        <TouchableOpacity onPress={clear}>
          <Text style={styles.clearBtn}>초기화</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="재료 검색 (초성 지원: ㄱㅁㄹ)"
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        <TouchableOpacity
          style={[styles.categoryTab, activeCategory === null && styles.categoryTabActive]}
          onPress={() => setActiveCategory(null)}
        >
          <Text
            style={[
              styles.categoryText,
              activeCategory === null && styles.categoryTextActive,
            ]}
          >
            전체
          </Text>
        </TouchableOpacity>
        {categories.map((cat: IngredientCategory) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryTab,
              activeCategory === cat.id && styles.categoryTabActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent}>
        {filteredIngredients.map((ing: Ingredient) => {
          const selected = selectedIds.has(ing.id);
          return (
            <TouchableOpacity
              key={ing.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => handleToggle(ing.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {ing.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        {filteredIngredients.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>검색 결과가 없어요</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`선택 완료 (${count()}개)`}
          onPress={() => router.push('/(tabs)/home/confirm')}
          disabled={count() === 0}
          size="large"
          style={styles.confirmButton}
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
  clearBtn: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchBox: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F0',
  },
  chipText: {
    fontSize: 14,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  confirmButton: {
    width: '100%',
  },
});
