import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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
  getCategoryEmoji,
} from '../../../src/constants/theme';
import { Button } from '../../../src/components/common/Button';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { ingredientApi } from '../../../src/api/ingredientApi';
import { useSelectionStore } from '../../../src/stores/selectionStore';
import { searchIngredients } from '../../../src/utils/search';
import type { Ingredient, IngredientCategory } from '../../../src/types/ingredient';

const GRID_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = spacing.md; // 16px
const GRID_COL_GAP = 12;
const GRID_ROW_GAP = 16;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_COL_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

export default function SelectScreen() {
  const router = useRouter();
  const { selectedIds, toggle, count, clear } = useSelectionStore();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearchInput(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(text), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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

  const selectedIngredients = useMemo(
    () => ingredients.filter((ing) => selectedIds.has(ing.id)),
    [ingredients, selectedIds],
  );

  const handleToggle = useCallback((id: number) => toggle(id), [toggle]);

  if (catLoading || ingLoading) return <Loading message="재료를 불러오는 중..." />;
  if (error) return <ErrorScreen message="재료 로드에 실패했습니다" onRetry={() => refetch()} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>재료 선택</Text>
        <TouchableOpacity onPress={clear}>
          <Text style={styles.clearBtn}>초기화</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="재료 검색 (초성 지원: ㄱㅁㄹ)"
          placeholderTextColor={colors.textTertiary}
          value={searchInput}
          onChangeText={handleSearchChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          autoCorrect={false}
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchInput(''); setSearchQuery(''); }}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryChips}
      >
        <TouchableOpacity
          style={[styles.categoryChip, activeCategory === null && styles.categoryChipActive]}
          onPress={() => setActiveCategory(null)}
        >
          <Text style={styles.categoryEmoji}>{getCategoryEmoji('전체')}</Text>
          <Text
            style={[
              styles.categoryLabel,
              activeCategory === null && styles.categoryLabelActive,
            ]}
          >
            전체
          </Text>
        </TouchableOpacity>
        {categories.map((cat: IngredientCategory) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              activeCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.name)}</Text>
            <Text
              style={[
                styles.categoryLabel,
                activeCategory === cat.id && styles.categoryLabelActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ingredient Grid */}
      <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent}>
        {filteredIngredients.length > 0 ? (
          <View style={styles.grid}>
            {filteredIngredients.map((ing: Ingredient) => {
              const selected = selectedIds.has(ing.id);
              return (
                <TouchableOpacity
                  key={ing.id}
                  style={styles.gridItem}
                  onPress={() => handleToggle(ing.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
                    <Text style={styles.ingredientEmoji}>
                      {getIngredientEmoji(ing.name)}
                    </Text>
                    {selected && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.ingredientName, selected && styles.ingredientNameSelected]}
                    numberOfLines={1}
                  >
                    {ing.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : searchQuery.trim() ? (
          <EmptyState
            emoji="🔍"
            title="검색 결과가 없어요"
            description="다른 키워드로 검색해보세요"
          />
        ) : (
          <EmptyState
            emoji="🥬"
            title="이 카테고리에 등록된 재료가 없어요"
          />
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {selectedIngredients.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedChips}
          >
            {selectedIngredients.map((ing) => (
              <TouchableOpacity
                key={ing.id}
                style={styles.selectedChip}
                onPress={() => toggle(ing.id)}
              >
                <Text style={styles.selectedChipText}>{ing.name}</Text>
                <Text style={styles.selectedChipX}>✕</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <Button
          title={count() > 0 ? `선택 완료 (${count()}개)` : '재료를 선택해주세요'}
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
  clearBtn: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    ...typography.caption,
    color: colors.textPrimary,
    padding: 0,
  },
  searchClear: {
    fontSize: 14,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
  // Categories
  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryChips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    ...typography.small,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  // Grid
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: GRID_COL_GAP,
    rowGap: GRID_ROW_GAP,
  },
  gridItem: {
    width: ITEM_SIZE,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  ingredientEmoji: {
    fontSize: 28,
  },
  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 11,
    color: colors.textInverse,
    fontWeight: '700',
  },
  ingredientName: {
    ...typography.small,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  ingredientNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    ...shadow.md,
    gap: spacing.sm,
  },
  selectedChips: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    gap: 4,
  },
  selectedChipText: {
    ...typography.small,
    color: colors.textInverse,
    fontWeight: '500',
  },
  selectedChipX: {
    fontSize: 10,
    color: colors.textInverse,
    opacity: 0.8,
  },
  confirmButton: {
    width: '100%',
  },
});
