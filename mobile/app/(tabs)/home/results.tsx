import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import {
  colors,
  typography,
  fontFamily,
  shadow,
  getIngredientEmoji,
  getCategoryEmoji,
} from '../../../src/constants/theme';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { SlideDrawer } from '../../../src/components/common/SlideDrawer';
import { recipeApi } from '../../../src/api/recipeApi';
import { ingredientApi } from '../../../src/api/ingredientApi';
import { useSelectionStore } from '../../../src/stores/selectionStore';
import { useFilterStore } from '../../../src/stores/filterStore';
import { formatCookTime, formatDifficulty, formatCategory, toAbsoluteImageUrl } from '../../../src/utils/format';
import type { Difficulty, RecipeSummary } from '../../../src/types/recipe';
import type { Ingredient, IngredientCategory } from '../../../src/types/ingredient';
import { useFavorites } from '../../../src/hooks/useFavorites';

type SortKey = 'matchRate' | 'time' | 'easy';

const TIME_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: '전체' },
  { value: 15, label: '15분' },
  { value: 30, label: '30분' },
  { value: 60, label: '60분' },
];

const DIFF_OPTIONS: { value: Difficulty | null; label: string }[] = [
  { value: null, label: '전체' },
  { value: 'EASY', label: '쉬움' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'HARD', label: '어려움' },
];

const SERVING_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: '전체' },
  { value: 1, label: '1인' },
  { value: 2, label: '2인' },
  { value: 4, label: '4인' },
];

const SORT_LABELS: Record<SortKey, string> = {
  matchRate: '매칭률 높은 순',
  time: '조리시간 짧은 순',
  easy: '쉬운 순',
};

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getIds } = useSelectionStore();
  const selectedIds = getIds();
  const {
    maxCookTimeMinutes, difficulty, servings,
    setMaxCookTime, setDifficulty, setServings, reset,
  } = useFilterStore();
  const [sortKey, setSortKey] = useState<SortKey>('matchRate');
  const [ingredientSheetOpen, setIngredientSheetOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [presetInstant, setPresetInstant] = useState(false);

  const { data: rawRecipes, isLoading, error, refetch } = useQuery({
    queryKey: ['recommend', selectedIds, maxCookTimeMinutes, difficulty, servings],
    queryFn: async () => {
      const res = await recipeApi.recommend({
        ingredientIds: selectedIds,
        maxTime: maxCookTimeMinutes ?? undefined,
        difficulty: difficulty ?? undefined,
        servings: servings ?? undefined,
      });
      return res.data.data;
    },
    enabled: selectedIds.length > 0,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: async () => (await ingredientApi.getCategories()).data.data,
    staleTime: 1000 * 60 * 30,
  });
  const { data: ingredientsData } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => (await ingredientApi.getAll()).data.data,
    staleTime: 1000 * 60 * 30,
  });

  const categories: IngredientCategory[] = categoriesData ?? [];
  const ingredients: Ingredient[] = ingredientsData ?? [];
  const selectedIngredients = useMemo(
    () => ingredients.filter((ing) => selectedIds.includes(ing.id)),
    [ingredients, selectedIds],
  );

  const recipes = rawRecipes ?? [];
  const sortedRecipes = useMemo(() => {
    const list = [...recipes];
    if (sortKey === 'matchRate') list.sort((a, b) => b.matchingRate - a.matchingRate);
    if (sortKey === 'time') list.sort((a, b) => a.cookingTimeMinutes - b.cookingTimeMinutes);
    if (sortKey === 'easy') {
      const order: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };
      list.sort((a, b) => (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9));
    }
    return list;
  }, [recipes, sortKey]);

  const activeFilterCount = [maxCookTimeMinutes, difficulty, servings].filter((v) => v !== null && v !== undefined).length;

  // 프리셋: "바로 가능" 은 클라 사이드 (matchingRate >= 100)
  const instantCount = useMemo(
    () => sortedRecipes.filter((r) => r.matchingRate >= 100).length,
    [sortedRecipes],
  );
  const displayedRecipes = presetInstant
    ? sortedRecipes.filter((r) => r.matchingRate >= 100)
    : sortedRecipes;

  const isAllPreset = !presetInstant && activeFilterCount === 0;
  const isTime15Preset = maxCookTimeMinutes === 15;
  const isEasyPreset = difficulty === 'EASY';

  if (selectedIds.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavBar count={0} onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🥬</Text>
          <Text style={styles.emptyTitle}>재료를 먼저 골라주세요</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.back()}>
            <Text style={styles.emptyBtnText}>재료 고르기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) return <Loading message="레시피를 찾는 중..." />;
  if (error) return <ErrorScreen message="추천 결과를 불러오지 못했어요" onRetry={() => refetch()} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavBar count={sortedRecipes.length} onBack={() => router.back()} />

      {/* 재료 요약 pill */}
      <TouchableOpacity
        style={styles.summaryPill}
        activeOpacity={0.85}
        onPress={() => setIngredientSheetOpen(true)}
      >
        <View style={styles.summaryEmojis}>
          {selectedIngredients.slice(0, 3).map((ing, i) => (
            <View
              key={ing.id}
              style={[styles.summaryEmoji, { marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }]}
            >
              <Text style={{ fontSize: 14 }}>{getIngredientEmoji(ing.name)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.summaryText}>
          선택한 재료 <Text style={styles.summaryNum}>{selectedIds.length}</Text>
        </Text>
        <Svg width={12} height={12} viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}>
          <Path d="M6 9l6 6 6-6" stroke={colors.textTertiary} strokeWidth={2} strokeLinecap="round" fill="none" />
        </Svg>
      </TouchableOpacity>

      {/* 프리셋 칩 + 고급 필터 */}
      <View style={styles.presetRowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetRowContent}
        >
          <PresetChip
            label="전체"
            count={sortedRecipes.length}
            active={isAllPreset}
            onPress={() => {
              setPresetInstant(false);
              reset();
            }}
          />
          <PresetChip
            label="바로 가능"
            count={instantCount}
            active={presetInstant}
            onPress={() => setPresetInstant((v) => !v)}
          />
          <PresetChip
            label="15분 이내"
            active={isTime15Preset}
            onPress={() => setMaxCookTime(isTime15Preset ? null : 15)}
          />
          <PresetChip
            label="쉬움"
            active={isEasyPreset}
            onPress={() => setDifficulty(isEasyPreset ? null : 'EASY')}
          />
        </ScrollView>
        <TouchableOpacity
          style={[styles.filterIconBtn, activeFilterCount > 0 && styles.filterIconBtnActive]}
          onPress={() => setFilterDrawerOpen(true)}
          activeOpacity={0.7}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="M3 6h18M6 12h12M10 18h4"
              stroke={activeFilterCount > 0 ? '#fff' : colors.textPrimary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {displayedRecipes.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>😅</Text>
          <Text style={styles.emptyTitle}>맞는 레시피가 없어요</Text>
          <Text style={styles.emptyDesc}>재료를 더 추가하거나 필터를 바꿔보세요</Text>
        </View>
      ) : (
        <FlatList
          data={displayedRecipes}
          keyExtractor={(r) => String(r.id)}
          renderItem={({ item }) => (
            <RecipeResultCard
              recipe={item}
              onPress={() =>
                router.push({
                  pathname: `/recipe/${item.id}`,
                  params: item.missingIngredients?.length
                    ? { missingIds: item.missingIngredients.map((i) => i.id).join(',') }
                    : undefined,
                })
              }
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 재료 요약 바텀시트 */}
      <IngredientSummarySheet
        visible={ingredientSheetOpen}
        onClose={() => setIngredientSheetOpen(false)}
        ingredients={selectedIngredients}
        categories={categories}
        onEdit={() => {
          setIngredientSheetOpen(false);
          router.back();
        }}
      />

      {/* 고급 필터 + 정렬 — 오른쪽 슬라이드 드로어 */}
      <FilterDrawer
        visible={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        time={maxCookTimeMinutes}
        diff={difficulty}
        servings={servings}
        sortKey={sortKey}
        onTimeChange={setMaxCookTime}
        onDiffChange={setDifficulty}
        onServingsChange={setServings}
        onSortChange={setSortKey}
        onReset={() => {
          reset();
          setPresetInstant(false);
          setSortKey('matchRate');
        }}
      />
    </SafeAreaView>
  );
}

// ---------- NavBar ----------
function NavBar({ count, onBack }: { count: number; onBack: () => void }) {
  return (
    <View style={styles.nav}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
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
      <Text style={styles.navTitle}>
        추천 결과 <Text style={styles.navCount}>{count}</Text>
      </Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

// ---------- Preset chip ----------
function PresetChip({
  label, count, active, onPress,
}: { label: string; count?: number; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.presetChip, active && styles.presetChipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.presetChipText, active && styles.presetChipTextActive]}>{label}</Text>
      {count !== undefined && (
        <Text style={[styles.presetChipCount, active && styles.presetChipCountActive]}>{count}</Text>
      )}
    </TouchableOpacity>
  );
}

// ---------- Recipe card ----------
function RecipeResultCard({ recipe, onPress }: { recipe: RecipeSummary; onPress: () => void }) {
  const { data: favorites } = useFavorites();
  const { toggle } = useFavoriteToggle();
  const favorite = favorites?.find((f) => f.recipeId === recipe.id);

  const matchColor =
    recipe.matchingRate >= 100 ? colors.success
    : recipe.matchingRate >= 70 ? colors.primary
    : recipe.matchingRate >= 50 ? '#F0A040'
    : colors.textTertiary;

  const missingText = (() => {
    const missing = recipe.missingIngredients ?? [];
    if (missing.length === 0) return null;
    if (missing.length <= 2) return missing.map((m) => m.name).join(', ');
    return `${missing[0].name}, ${missing[1].name} 외 ${missing.length - 2}개`;
  })();

  const isPerfect = recipe.matchingRate >= 100;
  const thumb = toAbsoluteImageUrl(recipe.thumbnailUrl ?? recipe.imageUrl);

  return (
    <TouchableOpacity
      style={[styles.card, isPerfect && styles.cardPerfect]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardThumbWrap}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.cardThumb} contentFit="cover" />
        ) : (
          <View style={[styles.cardThumb, styles.thumbPlaceholder]}>
            <Text style={{ fontSize: 28 }}>🍽️</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.bookmark}
          onPress={(e) => {
            e.stopPropagation();
            toggle(recipe.id, favorite?.id);
          }}
          hitSlop={8}
        >
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Path
              d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
              fill={favorite ? colors.primary : 'none'}
              stroke={favorite ? colors.primary : colors.textPrimary}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          {isPerfect && <View style={styles.readyDot} />}
          <Text style={styles.cardTitle} numberOfLines={1}>{recipe.title}</Text>
        </View>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {formatCookTime(recipe.cookingTimeMinutes)} · {formatDifficulty(recipe.difficulty)} · {formatCategory(recipe.category)}
        </Text>

        <View style={styles.matchSection}>
          <View style={styles.matchHead}>
            <Text style={styles.matchLabel}>재료 매칭률</Text>
            <Text style={[styles.matchRate, { color: matchColor }]}>
              {Math.round(recipe.matchingRate)}%
            </Text>
          </View>
          <View style={styles.matchBar}>
            <View
              style={[
                styles.matchFill,
                { width: `${Math.min(100, recipe.matchingRate)}%`, backgroundColor: matchColor },
              ]}
            />
          </View>
          {isPerfect ? (
            <Text style={styles.matchPerfect}>✓ 재료 완벽!</Text>
          ) : missingText ? (
            <Text style={styles.matchMissing} numberOfLines={1}>부족한 재료: {missingText}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function useFavoriteToggle() {
  const { add, remove } = useFavorites();
  return {
    toggle: (recipeId: number, favoriteId?: number) => {
      if (favoriteId) remove.mutate(favoriteId);
      else add.mutate(recipeId);
    },
  };
}

// ---------- Ingredient Summary Sheet ----------
interface IngredientSummarySheetProps {
  visible: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  categories: IngredientCategory[];
  onEdit: () => void;
}

function IngredientSummarySheet({ visible, onClose, ingredients, categories, onEdit }: IngredientSummarySheetProps) {
  const grouped = useMemo(() => {
    const m = new Map<number, Ingredient[]>();
    ingredients.forEach((ing) => {
      const arr = m.get(ing.categoryId) ?? [];
      arr.push(ing);
      m.set(ing.categoryId, arr);
    });
    return Array.from(m.entries())
      .map(([catId, list]) => ({ cat: categories.find((c) => c.id === catId), items: list }))
      .filter((g) => g.cat)
      .sort((a, b) => (a.cat!.sortOrder ?? 0) - (b.cat!.sortOrder ?? 0));
  }, [ingredients, categories]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.inkDark }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>
              선택한 재료 <Text style={{ color: colors.primary }}>{ingredients.length}</Text>
            </Text>
            <TouchableOpacity style={styles.sheetClose} onPress={onClose}>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M6 6l12 12M6 18l12-12" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 22, paddingTop: 8 }}>
            {grouped.map((g) => (
              <View key={g.cat!.id} style={{ marginBottom: 18 }}>
                <View style={styles.groupHead}>
                  <View style={styles.groupEmoBox}>
                    <Text style={{ fontSize: 13 }}>{getCategoryEmoji(g.cat!.name)}</Text>
                  </View>
                  <Text style={styles.groupName}>{g.cat!.name}</Text>
                  <Text style={styles.groupCount}>{g.items.length}</Text>
                </View>
                <View style={styles.groupChips}>
                  {g.items.map((ing) => (
                    <View key={ing.id} style={styles.chipDark}>
                      <Text style={{ fontSize: 13 }}>{getIngredientEmoji(ing.name)}</Text>
                      <Text style={styles.chipDarkText}>{ing.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sheetBottom}>
            <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.85}>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              <Text style={styles.editBtnText}>재료 다시 고르기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------- Filter Drawer (고급 필터 + 정렬) ----------
interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  time: number | null;
  diff: Difficulty | null;
  servings: number | null;
  sortKey: SortKey;
  onTimeChange: (v: number | null) => void;
  onDiffChange: (v: Difficulty | null) => void;
  onServingsChange: (v: number | null) => void;
  onSortChange: (k: SortKey) => void;
  onReset: () => void;
}

function FilterDrawer({
  visible, onClose, time, diff, servings, sortKey,
  onTimeChange, onDiffChange, onServingsChange, onSortChange, onReset,
}: FilterDrawerProps) {
  return (
    <SlideDrawer visible={visible} onClose={onClose} width="86%" side="right">
      <View style={styles.drawerHead}>
        <Text style={styles.drawerTitle}>고급 필터</Text>
        <TouchableOpacity style={styles.drawerCloseBtn} onPress={onClose} hitSlop={8}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path d="M6 6l12 12M6 18l12-12" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.drawerBody}>
        <FilterGroup label="조리 시간">
          {TIME_OPTIONS.map((o) => (
            <OptionPill
              key={String(o.value)}
              active={time === o.value}
              label={o.label}
              onPress={() => onTimeChange(o.value)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="난이도">
          {DIFF_OPTIONS.map((o) => (
            <OptionPill
              key={String(o.value)}
              active={diff === o.value}
              label={o.label}
              onPress={() => onDiffChange(o.value)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="인분">
          {SERVING_OPTIONS.map((o) => (
            <OptionPill
              key={String(o.value)}
              active={servings === o.value}
              label={o.label}
              onPress={() => onServingsChange(o.value)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="정렬">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <OptionPill
              key={k}
              active={sortKey === k}
              label={SORT_LABELS[k]}
              onPress={() => onSortChange(k)}
            />
          ))}
        </FilterGroup>
      </ScrollView>

      <View style={styles.drawerBottom}>
        <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.7}>
          <Text style={styles.resetBtnText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editBtn, { flex: 1, backgroundColor: colors.primary }]} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.editBtnText}>결과 보기</Text>
        </TouchableOpacity>
      </View>
    </SlideDrawer>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.filterGroupLabel}>{label}</Text>
      <View style={styles.optionRow}>{children}</View>
    </View>
  );
}

function OptionPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.optionPill, active && styles.optionPillActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.optionPillText, active && styles.optionPillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Nav
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  navTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  navCount: { color: colors.primary },

  // Summary pill
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
    ...shadow.sm,
  },
  summaryEmojis: { flexDirection: 'row' },
  summaryEmoji: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  summaryText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  summaryNum: { color: colors.primary, fontFamily: fontFamily.bold },

  // Preset chip row + 고급 필터 아이콘
  presetRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    paddingVertical: 6,
  },
  presetRowContent: { paddingHorizontal: 16, gap: 6, paddingVertical: 4 },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  presetChipActive: {
    backgroundColor: colors.inkDark,
    borderColor: colors.inkDark,
  },
  presetChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  presetChipTextActive: { color: '#fff' },
  presetChipCount: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textTertiary,
    marginLeft: 2,
  },
  presetChipCountActive: { color: 'rgba(255,255,255,0.75)' },

  filterIconBtn: {
    width: 36,
    height: 32,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIconBtnActive: {
    backgroundColor: colors.inkDark,
    borderColor: colors.inkDark,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 9,
    color: '#fff',
  },

  // Drawer
  drawerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  drawerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  drawerCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBody: { padding: 22, paddingTop: 14 },
  drawerBottom: {
    flexDirection: 'row',
    gap: 8,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },

  // Count row
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  countText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  countNum: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    gap: 12,
    ...shadow.sm,
  },
  cardPerfect: {
    borderColor: colors.accent2,
  },
  cardThumbWrap: { position: 'relative' },
  cardThumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: colors.lineSoft,
  },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  bookmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  matchSection: { marginTop: 8 },
  matchHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  matchLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  matchRate: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    letterSpacing: -0.3,
  },
  matchBar: {
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  matchFill: { height: '100%', borderRadius: 2 },
  matchPerfect: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.success,
    marginTop: 6,
  },
  matchMissing: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginTop: 6 },
  emptyDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  emptyBtn: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  emptyBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#fff',
  },

  // Sheet
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    maxHeight: '78%',
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
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  groupEmoBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  groupCount: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.4)',
  },
  groupChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chipDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  chipDarkText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: '#fff',
  },

  sheetBottom: {
    padding: 22,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.inkDark,
  },
  editBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  editBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#fff',
    letterSpacing: -0.3,
  },
  resetBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Filter groups
  filterGroupLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: colors.lineSoft,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionPillActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  optionPillText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  optionPillTextActive: { color: colors.primary, fontFamily: fontFamily.bold },

  // Sort row
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sortRowText: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
