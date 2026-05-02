import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  colors,
  typography,
  shadow,
  fontFamily,
} from '../../../src/constants/theme';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { ingredientApi } from '../../../src/api/ingredientApi';
import { useFridge } from '../../../src/hooks/useFridge';
import { searchIngredients } from '../../../src/utils/search';
import type { Ingredient, IngredientCategory } from '../../../src/types/ingredient';

const RAIL_WIDTH = 70;

interface IngredientRowProps {
  ingredient: Ingredient;
  held: boolean;
  onToggle: (id: number, held: boolean) => void;
}

const IngredientRow = React.memo(function IngredientRow({
  ingredient,
  held,
  onToggle,
}: IngredientRowProps) {
  const onPress = useCallback(() => onToggle(ingredient.id, held), [onToggle, ingredient.id, held]);
  return (
    <TouchableOpacity
      style={[styles.ingRow, held && styles.ingRowSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.irEmo}>{ingredient.resolvedEmoji ?? ''}</Text>
      <Text style={styles.irName} numberOfLines={1}>{ingredient.name}</Text>
      <View style={[styles.cb, held && styles.cbSelected]}>
        {held && (
          <Svg width={10} height={10} viewBox="0 0 24 24">
            <Path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          </Svg>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function FridgeScreen() {
  const { data: fridgeData, isLoading: fridgeLoading, add, remove } = useFridge();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<Ingredient>>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearchInput(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (!text) {
      setSearchQuery('');
      return;
    }
    debounceRef.current = setTimeout(() => setSearchQuery(text), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { data: categoriesData } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: async () => (await ingredientApi.getCategories()).data.data,
    staleTime: 1000 * 60 * 30,
  });
  const { data: ingredientsData, isLoading: ingLoading, error, refetch } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => (await ingredientApi.getAll()).data.data,
    staleTime: 1000 * 60 * 30,
  });

  const categories: IngredientCategory[] = categoriesData ?? [];
  const ingredients: Ingredient[] = ingredientsData ?? [];
  const fridgeIds = useMemo(
    () => new Set((fridgeData ?? []).map((f) => f.ingredientId)),
    [fridgeData],
  );

  const countsByCategory = useMemo(() => {
    const m = new Map<number, number>();
    ingredients.forEach((ing) => {
      if (fridgeIds.has(ing.id)) m.set(ing.categoryId, (m.get(ing.categoryId) ?? 0) + 1);
    });
    return m;
  }, [ingredients, fridgeIds]);

  const displayedList = useMemo(() => {
    let list = ingredients;
    if (searchQuery.trim()) return searchIngredients(searchQuery, list);
    if (activeCategory !== null) return list.filter((ing) => ing.categoryId === activeCategory);
    return list;
  }, [ingredients, activeCategory, searchQuery]);

  // 카테고리/검색 변경 시 패널 스크롤 최상단으로 (RAF로 미뤄야 layout 재계산 후 적용됨)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
    return () => cancelAnimationFrame(raf);
  }, [activeCategory, searchQuery]);

  const activeCatName = useMemo(() => {
    if (searchQuery.trim()) return `"${searchQuery}" 검색 결과`;
    if (activeCategory === null) return '전체';
    return categories.find((c) => c.id === activeCategory)?.name ?? '전체';
  }, [activeCategory, categories, searchQuery]);

  const catTotal = useMemo(() => {
    if (activeCategory === null) return ingredients.length;
    return ingredients.filter((ing) => ing.categoryId === activeCategory).length;
  }, [ingredients, activeCategory]);

  const catHeldCount = useMemo(() => {
    if (activeCategory === null) return fridgeIds.size;
    return countsByCategory.get(activeCategory) ?? 0;
  }, [activeCategory, countsByCategory, fridgeIds]);

  // Preview (최대 8개, 최근 추가 순)
  const previewItems = useMemo(
    () => (fridgeData ?? []).slice(0, 8),
    [fridgeData],
  );

  // Grouped for sheet
  const grouped = useMemo(() => {
    const map = new Map<number, { category: IngredientCategory | undefined; items: Ingredient[] }>();
    (fridgeData ?? []).forEach((f) => {
      const ing = ingredients.find((i) => i.id === f.ingredientId);
      if (!ing) return;
      const cat = categories.find((c) => c.id === ing.categoryId);
      const key = ing.categoryId;
      const existing = map.get(key) ?? { category: cat, items: [] };
      existing.items.push(ing);
      map.set(key, existing);
    });
    return Array.from(map.values())
      .filter((g) => !!g.category)
      .sort((a, b) => (a.category!.sortOrder ?? 0) - (b.category!.sortOrder ?? 0));
  }, [fridgeData, ingredients, categories]);

  // 행에서 자기 held를 넘겨주므로 fridgeIds 의존 제거 → 레퍼런스 안정 → 메모 행 재렌더 방지
  const handleToggle = useCallback((ingredientId: number, currentlyHeld: boolean) => {
    if (currentlyHeld) {
      remove.mutate(ingredientId);
    } else {
      add.mutate(ingredientId);
    }
  }, [add, remove]);

  if ((fridgeLoading && !fridgeData) || ingLoading) return <Loading message="냉장고 재료 불러오는 중..." />;
  if (error) return <ErrorScreen message="재료 로드 실패" onRetry={() => refetch()} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <Text style={styles.navTitle}>내 냉장고</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Circle cx={11} cy={11} r={7} stroke={colors.textTertiary} strokeWidth={2} fill="none" />
          <Path d="m20 20-3.5-3.5" stroke={colors.textTertiary} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <TextInput
          value={searchInput}
          onChangeText={handleSearchChange}
          placeholder="재료를 검색해보세요"
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
          autoCorrect={false}
        />
        {searchInput.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
              }
              setSearchInput('');
              setSearchQuery('');
            }}
          >
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Preview card — tap to open sheet */}
      <TouchableOpacity
        style={styles.previewCard}
        activeOpacity={0.85}
        onPress={() => setSheetOpen(true)}
        disabled={fridgeIds.size === 0}
      >
        <View style={styles.previewTop}>
          <Text style={styles.previewCount}>
            <Text style={styles.previewCountNum}>{fridgeIds.size}</Text>개 재료
          </Text>
          {fridgeIds.size > 0 && (
            <View style={styles.seeAll}>
              <Text style={styles.seeAllText}>모두 보기</Text>
              <Svg width={12} height={12} viewBox="0 0 24 24">
                <Path d="M9 18l6-6-6-6" stroke={colors.primary} strokeWidth={2.2} strokeLinecap="round" fill="none" />
              </Svg>
            </View>
          )}
        </View>
        {fridgeIds.size > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipLane}
          >
            {previewItems.map((item) => {
              const ing = ingredients.find((i) => i.id === item.ingredientId);
              if (!ing) return null;
              return (
                <View key={item.ingredientId} style={styles.previewChip}>
                  <Text style={{ fontSize: 13 }}>{ing.resolvedEmoji ?? ''}</Text>
                  <Text style={styles.previewChipText}>{ing.name}</Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.emptyHint}>아래에서 자주 쓰는 재료를 체크해주세요</Text>
        )}
      </TouchableOpacity>

      {/* Split */}
      <View style={styles.split}>
        {/* Rail */}
        <ScrollView style={styles.rail} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <TouchableOpacity
            style={[styles.railItem, activeCategory === null && styles.railItemActive]}
            onPress={() => { setActiveCategory(null); setSearchInput(''); setSearchQuery(''); }}
            activeOpacity={0.8}
          >
            <View style={[styles.rEmo, activeCategory === null && { backgroundColor: colors.primary }]}>
              <Text style={styles.rEmoText}>🍽️</Text>
            </View>
            <Text style={[styles.rName, activeCategory === null && styles.rNameActive]}>전체</Text>
            {fridgeIds.size > 0 && (
              <View style={styles.railBadge}>
                <Text style={styles.railBadgeText}>{fridgeIds.size}</Text>
              </View>
            )}
          </TouchableOpacity>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const cnt = countsByCategory.get(cat.id) ?? 0;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.railItem, isActive && styles.railItemActive]}
                onPress={() => { setActiveCategory(cat.id); setSearchInput(''); setSearchQuery(''); }}
                activeOpacity={0.8}
              >
                <View style={[styles.rEmo, isActive && { backgroundColor: colors.primary }]}>
                  <Text style={styles.rEmoText}>{cat.emoji ?? ''}</Text>
                </View>
                <Text style={[styles.rName, isActive && styles.rNameActive]} numberOfLines={1}>
                  {cat.name}
                </Text>
                {cnt > 0 && (
                  <View style={styles.railBadge}>
                    <Text style={styles.railBadgeText}>{cnt}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Panel */}
        <View style={styles.panel}>
          <FlatList
            ref={listRef}
            data={displayedList}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <IngredientRow
                ingredient={item}
                held={fridgeIds.has(item.id)}
                onToggle={handleToggle}
              />
            )}
            ListHeaderComponent={
              <View style={styles.panelHead}>
                <Text style={styles.panelHeadTitle}>{activeCatName}</Text>
                <Text style={styles.panelHeadSub}>
                  {catHeldCount} / {catTotal} 보유
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyPanel}>
                <Text style={styles.emptyPanelEmoji}>{searchQuery ? '🔍' : '🥬'}</Text>
                <Text style={styles.emptyPanelText}>
                  {searchQuery ? '검색 결과가 없어요' : '이 카테고리엔 재료가 없어요'}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            windowSize={10}
            removeClippedSubviews
          />
        </View>
      </View>

      {/* View Sheet */}
      <ViewSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        grouped={grouped}
        total={fridgeIds.size}
      />
    </SafeAreaView>
  );
}

// ---------- View Sheet ----------
function ViewSheet({
  visible, onClose, grouped, total,
}: {
  visible: boolean;
  onClose: () => void;
  grouped: { category: IngredientCategory | undefined; items: Ingredient[] }[];
  total: number;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>
              내 냉장고 재료 <Text style={{ color: colors.primary }}>{total}</Text>
            </Text>
            <TouchableOpacity style={styles.sheetClose} onPress={onClose}>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M6 9l6 6 6-6" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" fill="none" />
              </Svg>
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetSub}>카테고리별로 묶어서 보여드려요</Text>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 22, paddingTop: 0 }}>
            {grouped.map((g) => (
              <View key={g.category!.id} style={{ marginBottom: 20 }}>
                <View style={styles.groupHead}>
                  <View style={styles.groupEmoBox}>
                    <Text style={{ fontSize: 13 }}>{g.category!.emoji ?? ''}</Text>
                  </View>
                  <Text style={styles.groupName}>{g.category!.name}</Text>
                  <Text style={styles.groupCount}>{g.items.length}</Text>
                </View>
                <View style={styles.groupChips}>
                  {g.items.map((ing) => (
                    <View key={ing.id} style={styles.chipLight}>
                      <Text style={{ fontSize: 13 }}>{ing.resolvedEmoji ?? ''}</Text>
                      <Text style={styles.chipLightText}>{ing.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Nav
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navTitle: { ...typography.h1, fontSize: 18, color: colors.textPrimary, fontFamily: fontFamily.bold },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 46,
    ...shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    padding: 0,
  },
  searchClear: {
    fontSize: 14,
    color: colors.textTertiary,
    padding: 4,
  },

  // Preview card
  previewCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewCount: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  previewCountNum: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    color: colors.primary,
  },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.primary,
  },
  chipLane: { gap: 6, paddingRight: 20 },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingLeft: 9,
    paddingRight: 11,
    backgroundColor: colors.lineSoft,
    borderRadius: 100,
  },
  previewChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.textPrimary,
  },
  emptyHint: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Split
  split: { flex: 1, flexDirection: 'row' },
  rail: {
    width: RAIL_WIDTH,
    flexShrink: 0,
    flexGrow: 0,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  railItem: {
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 3,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 10,
    marginBottom: 2,
    position: 'relative',
  },
  railItemActive: { backgroundColor: colors.accentSoft },
  rEmo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rEmoText: { fontSize: 15 },
  rName: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: -0.3,
  },
  rNameActive: { color: colors.primary, fontFamily: fontFamily.bold },
  railBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 7.5,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  railBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    color: '#fff',
  },

  panel: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  panelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  panelHeadTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  panelHeadSub: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textTertiary,
  },

  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  ingRowSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  irEmo: { fontSize: 19, width: 28, textAlign: 'center' },
  irName: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  cb: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  emptyPanel: { paddingVertical: 40, alignItems: 'center', gap: 6 },
  emptyPanelEmoji: { fontSize: 28 },
  emptyPanelText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Sheet
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31,22,18,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    height: '72%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 3,
    marginBottom: 14,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSub: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textTertiary,
  },

  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  groupEmoBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  groupCount: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textTertiary,
  },
  groupChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chipLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingLeft: 9,
    paddingRight: 11,
    backgroundColor: colors.lineSoft,
    borderRadius: 100,
  },
  chipLightText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.textPrimary,
  },
});
