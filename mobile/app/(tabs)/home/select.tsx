import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useSelectionStore } from '../../../src/stores/selectionStore';
import { useFridge } from '../../../src/hooks/useFridge';
import { searchIngredients } from '../../../src/utils/search';
import type { Ingredient, IngredientCategory } from '../../../src/types/ingredient';

const RAIL_WIDTH = 70;

// 행 단위 셀렉션 구독으로 토글 시 해당 행만 재렌더
const IngredientRow = React.memo(function IngredientRow({
  ingredient,
}: {
  ingredient: Ingredient;
}) {
  const selected = useSelectionStore((s) => s.selectedIds.has(ingredient.id));
  const toggle = useSelectionStore((s) => s.toggle);
  const onPress = useCallback(() => toggle(ingredient.id), [toggle, ingredient.id]);
  return (
    <TouchableOpacity
      style={[styles.ingRow, selected && styles.ingRowSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.irEmo}>{ingredient.resolvedEmoji ?? ''}</Text>
      <Text style={styles.irName} numberOfLines={1}>{ingredient.name}</Text>
      <View style={[styles.cb, selected && styles.cbSelected]}>
        {selected && (
          <Svg width={10} height={10} viewBox="0 0 24 24">
            <Path
              d="M5 12l5 5L20 7"
              stroke="#fff"
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function SelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedIds, toggle, count, clear, addMultiple } = useSelectionStore();
  const { data: fridgeItems } = useFridge();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<Ingredient>>(null);

  // 카테고리/검색어 변경 시 패널 스크롤 최상단으로.
  // RAF로 한 프레임 미뤄야 FlashList가 새 data 길이로 layout 재계산 후 스크롤됨.
  // (즉시 호출하면 1개→200개 전환 시 첫 행들이 가시 영역 밖에 그려지는 이슈)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
    return () => cancelAnimationFrame(raf);
  }, [activeCategory, searchQuery]);

  // 화면 fresh mount마다 1회: 이전 선택 폐기 + 냉장고 재료를 기본으로 세팅
  // (이전엔 effect 두 개로 분리돼있어서 두번째 effect의 closure가 stale selectedIds.size를 캡처 →
  //  alternating 버그. 단일 effect로 통합 + setState 직접 호출로 race 제거)
  useEffect(() => {
    if (prefilled || !fridgeItems) return;
    const ids = fridgeItems.map((f) => f.ingredientId);
    useSelectionStore.setState({ selectedIds: new Set(ids) });
    setPrefilled(true);
  }, [fridgeItems, prefilled]);

  const handleLoadFromFridge = useCallback(() => {
    if (!fridgeItems) return;
    addMultiple(fridgeItems.map((f) => f.ingredientId));
  }, [fridgeItems, addMultiple]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchInput(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // 빈 텍스트는 즉시 반영 — 디바운스 두면 backspace로 다 지운 직후 300ms간 빈 결과 화면이 노출됨
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

  const { data: categoriesData, isLoading: catLoading } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: async () => (await ingredientApi.getCategories()).data.data,
  });
  const { data: ingredientsData, isLoading: ingLoading, error, refetch } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => (await ingredientApi.getAll()).data.data,
  });

  const categories: IngredientCategory[] = categoriesData ?? [];
  const ingredients: Ingredient[] = ingredientsData ?? [];

  // 카테고리별 선택 개수 (레일 배지용)
  const countsByCategory = useMemo(() => {
    const m = new Map<number, number>();
    ingredients.forEach((ing) => {
      if (selectedIds.has(ing.id)) m.set(ing.categoryId, (m.get(ing.categoryId) ?? 0) + 1);
    });
    return m;
  }, [ingredients, selectedIds]);

  const displayedList = useMemo(() => {
    let list = ingredients;
    if (searchQuery.trim()) return searchIngredients(searchQuery, list);
    if (activeCategory !== null) return list.filter((ing) => ing.categoryId === activeCategory);
    return list;
  }, [ingredients, activeCategory, searchQuery]);

  const selectedList = useMemo(
    () => ingredients.filter((ing) => selectedIds.has(ing.id)),
    [ingredients, selectedIds],
  );

  const activeCatName = useMemo(() => {
    if (searchQuery.trim()) return `"${searchQuery}" 검색 결과`;
    if (activeCategory === null) return '전체';
    return categories.find((c) => c.id === activeCategory)?.name ?? '전체';
  }, [activeCategory, categories, searchQuery]);

  const catTotal = useMemo(() => {
    if (activeCategory === null) return ingredients.length;
    return ingredients.filter((ing) => ing.categoryId === activeCategory).length;
  }, [ingredients, activeCategory]);

  const catSelectedCount = useMemo(() => {
    if (activeCategory === null) return selectedIds.size;
    return countsByCategory.get(activeCategory) ?? 0;
  }, [activeCategory, countsByCategory, selectedIds]);

  if (catLoading || ingLoading) return <Loading message="재료를 불러오는 중..." />;
  if (error) return <ErrorScreen message="재료 로드에 실패했습니다" onRetry={() => refetch()} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={colors.textPrimary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>재료 선택</Text>
        {fridgeItems && fridgeItems.length > 0 ? (
          <TouchableOpacity
            style={styles.fridgeBtn}
            onPress={handleLoadFromFridge}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12 }}>🧊</Text>
            <Text style={styles.fridgeBtnText}>냉장고에서</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
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

      {/* Split */}
      <View style={styles.split}>
        {/* Rail */}
        <ScrollView
          style={styles.rail}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* 전체 */}
          <TouchableOpacity
            style={[styles.railItem, activeCategory === null && styles.railItemActive]}
            onPress={() => { setActiveCategory(null); setSearchInput(''); setSearchQuery(''); }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.rEmo,
                activeCategory === null && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.rEmoText}>🍽️</Text>
            </View>
            <Text
              style={[styles.rName, activeCategory === null && styles.rNameActive]}
              numberOfLines={1}
            >
              전체
            </Text>
            {selectedIds.size > 0 && (
              <View style={styles.railBadge}>
                <Text style={styles.railBadgeText}>{selectedIds.size}</Text>
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
                <Text
                  style={[styles.rName, isActive && styles.rNameActive]}
                  numberOfLines={1}
                >
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
            renderItem={({ item }) => <IngredientRow ingredient={item} />}
            ListHeaderComponent={
              <View style={styles.panelHead}>
                <Text style={styles.panelHeadTitle}>{activeCatName}</Text>
                <Text style={styles.panelHeadSub}>
                  {catSelectedCount} / {catTotal} 선택
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>{searchQuery ? '🔍' : '🥬'}</Text>
                <Text style={styles.emptyText}>
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

      {/* Floating cart */}
      <FloatingCart
        count={count()}
        items={selectedList}
        onRemove={(id) => toggle(id)}
        onExpand={() => setSheetOpen(true)}
        onSubmit={() => router.push('/(tabs)/home/results')}
        bottomInset={insets.bottom}
      />

      {/* Expanded sheet (C1-M) */}
      <SelectedSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        items={selectedList}
        categories={categories}
        onRemove={(id) => toggle(id)}
        onClearAll={clear}
        onSubmit={() => {
          setSheetOpen(false);
          router.push('/(tabs)/home/results');
        }}
      />
    </SafeAreaView>
  );
}

// ---------- Floating Cart ----------
interface FloatingCartProps {
  count: number;
  items: Ingredient[];
  onRemove: (id: number) => void;
  onExpand: () => void;
  onSubmit: () => void;
  bottomInset: number;
}

function FloatingCart({ count, items, onRemove, onExpand, onSubmit, bottomInset }: FloatingCartProps) {
  const disabled = count === 0;
  return (
    <View style={[styles.cart, { paddingBottom: Math.max(bottomInset, 16) }]}>
      <View style={styles.cartHead}>
        <Text style={styles.cartLabel}>
          선택한 재료 <Text style={styles.cartLabelNum}>{count}</Text>
        </Text>
        <TouchableOpacity style={styles.expandBtn} onPress={onExpand} disabled={disabled} activeOpacity={0.7}>
          <Text style={[styles.expandText, disabled && { opacity: 0.4 }]}>모두 보기</Text>
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Path
              d="M6 15l6-6 6 6"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {count > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cartChips}
        >
          {items.slice(0, 10).map((ing) => (
            <TouchableOpacity
              key={ing.id}
              style={styles.cartChip}
              onPress={() => onRemove(ing.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.cartChipEmo}>{ing.resolvedEmoji ?? ''}</Text>
              <Text style={styles.cartChipText}>{ing.name}</Text>
              <Text style={styles.cartChipX}>×</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.cartCta, disabled && styles.cartCtaDisabled]}
        onPress={onSubmit}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <Text style={[styles.cartCtaText, disabled && styles.cartCtaTextDisabled]}>
          이 재료로 요리 추천받기
        </Text>
        {!disabled && (
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path
              d="M5 12h14M13 5l7 7-7 7"
              stroke="#fff"
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ---------- Expanded Sheet (C1-M) ----------
interface SelectedSheetProps {
  visible: boolean;
  onClose: () => void;
  items: Ingredient[];
  categories: IngredientCategory[];
  onRemove: (id: number) => void;
  onClearAll: () => void;
  onSubmit: () => void;
}

function SelectedSheet({
  visible,
  onClose,
  items,
  categories,
  onRemove,
  onClearAll,
  onSubmit,
}: SelectedSheetProps) {
  const grouped = useMemo(() => {
    const map = new Map<number, Ingredient[]>();
    items.forEach((ing) => {
      const arr = map.get(ing.categoryId) ?? [];
      arr.push(ing);
      map.set(ing.categoryId, arr);
    });
    return Array.from(map.entries())
      .map(([catId, list]) => ({
        category: categories.find((c) => c.id === catId),
        items: list,
      }))
      .filter((g) => !!g.category)
      .sort((a, b) => (a.category!.sortOrder ?? 0) - (b.category!.sortOrder ?? 0));
  }, [items, categories]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>
              선택한 재료 <Text style={styles.sheetTitleNum}>{items.length}</Text>
            </Text>
            <TouchableOpacity style={styles.sheetClose} onPress={onClose} activeOpacity={0.8}>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path
                  d="M6 9l6 6 6-6"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.clearRow}>
            <Text style={styles.clearSub}>카테고리별로 묶어서 보여드려요</Text>
            <TouchableOpacity onPress={onClearAll} style={styles.clearBtn} activeOpacity={0.7}>
              <Svg width={11} height={11} viewBox="0 0 24 24">
                <Path
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              <Text style={styles.clearText}>전체 해제</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.groupsScroll} contentContainerStyle={{ padding: 22, paddingTop: 4 }}>
            {grouped.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: fontFamily.medium }}>
                  선택한 재료가 없어요
                </Text>
              </View>
            ) : (
              grouped.map((g) => (
                <View key={g.category!.id} style={styles.group}>
                  <View style={styles.groupHead}>
                    <View style={styles.gEmo}>
                      <Text style={{ fontSize: 13 }}>{g.category!.emoji ?? ''}</Text>
                    </View>
                    <Text style={styles.gName}>{g.category!.name}</Text>
                    <Text style={styles.gCount}>{g.items.length}</Text>
                  </View>
                  <View style={styles.gChips}>
                    {g.items.map((ing) => (
                      <TouchableOpacity
                        key={ing.id}
                        style={styles.exChip}
                        onPress={() => onRemove(ing.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.exChipEmo}>{ing.resolvedEmoji ?? ''}</Text>
                        <Text style={styles.exChipText}>{ing.name}</Text>
                        <View style={styles.exChipX}>
                          <Svg width={8} height={8} viewBox="0 0 24 24">
                            <Path
                              d="M6 6l12 12M6 18l12-12"
                              stroke="rgba(255,255,255,0.7)"
                              strokeWidth={3}
                              strokeLinecap="round"
                            />
                          </Svg>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.sheetBottom}>
            <View style={styles.summary}>
              <Text style={styles.summaryNum}>
                <Text style={styles.summaryNumBold}>{items.length}개</Text> 선택
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.cartCta, items.length === 0 && styles.cartCtaDisabled]}
              onPress={onSubmit}
              disabled={items.length === 0}
              activeOpacity={0.85}
            >
              <Text style={[styles.cartCtaText, items.length === 0 && styles.cartCtaTextDisabled]}>
                이 재료로 요리 추천받기
              </Text>
              {items.length > 0 && (
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path
                    d="M5 12h14M13 5l7 7-7 7"
                    stroke="#fff"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Nav
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  navTitle: {
    ...typography.h3,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  fridgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent2,
  },
  fridgeBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: -0.2,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 4,
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

  // Split
  split: {
    flex: 1,
    flexDirection: 'row',
  },
  rail: {
    width: RAIL_WIDTH,
    flexShrink: 0,
    flexGrow: 0,
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  railItem: {
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 2,
    paddingVertical: 7,
    paddingHorizontal: 0,
    borderRadius: 8,
    marginBottom: 2,
    position: 'relative',
  },
  railItemActive: {
    backgroundColor: colors.accentSoft,
  },
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
  rNameActive: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },
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
    letterSpacing: -0.2,
  },

  // Panel
  panel: { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
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
    letterSpacing: -0.3,
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

  empty: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 6,
  },
  emptyEmoji: { fontSize: 28 },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Floating Cart
  cart: {
    backgroundColor: colors.inkDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    shadowColor: '#1F1612',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  cartHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cartLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.8,
  },
  cartLabelNum: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: colors.primary,
  },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  expandText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  cartChips: {
    gap: 5,
    paddingBottom: 10,
  },
  cartChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 100,
    paddingVertical: 5,
    paddingLeft: 8,
    paddingRight: 10,
  },
  cartChipEmo: { fontSize: 12 },
  cartChipText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: '#fff',
  },
  cartChipX: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fontFamily.bold,
    marginLeft: 2,
  },
  cartCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  cartCtaDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cartCtaText: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: '#fff',
    letterSpacing: -0.3,
  },
  cartCtaTextDisabled: {
    color: 'rgba(255,255,255,0.45)',
  },

  // Sheet
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.inkDark,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    height: '78%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 14,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: '#fff',
    letterSpacing: -0.3,
  },
  sheetTitleNum: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 10,
  },
  clearSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.75)',
  },
  groupsScroll: { flex: 1 },
  group: { marginBottom: 18 },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  gEmo: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gName: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: -0.3,
  },
  gCount: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 2,
  },
  gChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  exChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
  },
  exChipEmo: { fontSize: 13 },
  exChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: '#fff',
    letterSpacing: -0.3,
  },
  exChipX: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  sheetBottom: {
    padding: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.inkDark,
    paddingBottom: 30,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryNum: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  summaryNumBold: {
    fontFamily: fontFamily.bold,
    color: '#fff',
  },
});
