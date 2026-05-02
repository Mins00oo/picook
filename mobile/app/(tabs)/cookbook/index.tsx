import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, fontFamily, shadow } from '../../../src/constants/theme';
import { useCookbookList } from '../../../src/hooks/useCookbook';
import {
  toAbsoluteImageUrl,
  formatCookTime,
  formatDifficulty,
  formatCategory,
} from '../../../src/utils/format';
import { Loading } from '../../../src/components/common/Loading';
import type { CookbookEntry } from '../../../src/api/cookbookApi';

const STAR_COLOR = '#FFB43B';
const HIGHLIGHT_YELLOW = '#FFE99B';
const TAPE_YELLOW = '#F5C842';
const PAD = 22;

type ViewMode = 'card' | 'grid';
type SortMode = 'latest' | 'oldest' | 'rating-desc' | 'rating-asc';

const CURRENT_YEAR = new Date().getFullYear();

export default function CookbookListScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCookbookList();

  // 통계/월별 카운트를 위해 모든 페이지를 백그라운드에서 자동 로드
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allEntries = useMemo<CookbookEntry[]>(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );

  // 사용자가 기록을 남긴 연도(최신순). 없으면 현재 연도 폴백.
  const years = useMemo(() => {
    const set = new Set<number>();
    allEntries.forEach((e) => set.add(new Date(e.cookedAt).getFullYear()));
    if (set.size === 0) set.add(CURRENT_YEAR);
    return Array.from(set).sort((a, b) => b - a);
  }, [allEntries]);

  const [view, setView] = useState<ViewMode>('card');
  const [sort, setSort] = useState<SortMode>('latest');
  const [search, setSearch] = useState('');
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [month, setMonth] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // entries 로딩 후 사용자가 기록 없는 연도면 가장 최신 연도로 점프
  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const yearEntries = useMemo(
    () => allEntries.filter((e) => new Date(e.cookedAt).getFullYear() === year),
    [allEntries, year],
  );

  // 연도 통계 (월 필터 무관)
  const stats = useMemo(() => {
    const count = yearEntries.length;
    const avgRating = count
      ? yearEntries.reduce((s, e) => s + e.rating, 0) / count
      : 0;
    const catCount = new Map<string, number>();
    yearEntries.forEach((e) => {
      const c = formatCategory(e.recipeCategory ?? '').trim() || '기타';
      catCount.set(c, (catCount.get(c) ?? 0) + 1);
    });
    let topCategory = '—';
    let topMax = 0;
    catCount.forEach((v, k) => {
      if (v > topMax) {
        topMax = v;
        topCategory = k;
      }
    });
    return { count, avgRating, topCategory };
  }, [yearEntries]);

  // 현재 year의 월별 카운트 (1~12) — 메인 버튼의 카운트 표시용
  const monthCounts = useMemo(() => {
    const arr = new Array(12).fill(0);
    yearEntries.forEach((e) => {
      const m = new Date(e.cookedAt).getMonth();
      arr[m] += 1;
    });
    return arr;
  }, [yearEntries]);

  // year + month 필터 + 검색 + 정렬
  const filtered = useMemo(() => {
    let r = yearEntries;
    if (month != null) {
      r = r.filter((e) => new Date(e.cookedAt).getMonth() + 1 === month);
    }
    const q = search.trim().toLowerCase();
    if (q) r = r.filter((e) => e.recipeTitle.toLowerCase().includes(q));
    const sorted = [...r];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'latest':
          return new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime();
        case 'oldest':
          return new Date(a.cookedAt).getTime() - new Date(b.cookedAt).getTime();
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
      }
    });
    return sorted;
  }, [yearEntries, month, search, sort]);

  const sectionTitle =
    month != null ? `${year}년 ${month}월` : `${year}년 전체`;

  // 카드뷰에서 별점 5점 첫 카드에 BEST 테이프
  const bestIdx = useMemo(() => {
    if (view !== 'card' || filtered.length === 0) return -1;
    return filtered.findIndex((e) => e.rating >= 5);
  }, [filtered, view]);

  const gridCellSize = (screenWidth - PAD * 2 - 4 * 2) / 3;
  const monthCellSize = (screenWidth - PAD * 2 - 6 * 3) / 4;

  if (isLoading) return <Loading />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <View style={styles.iconBtn} />
        <Text style={styles.navTitle}>요리북</Text>
        <View style={styles.iconBtn} />
      </View>

      {allEntries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
          <Text style={styles.emptyDesc}>
            요리 완료 후 평가를 남기면 여기에 쌓여요
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.emptyBtnText}>재료 골라보기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Editorial 통계 헤더 */}
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{stats.count}</Text>
              <Text style={styles.statLabel}>총 요리</Text>
              <View style={styles.statDivider} />
            </View>
            <View style={styles.statCell}>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>
                  {stats.avgRating.toFixed(1)}
                </Text>
                <Text style={styles.statStar}>★</Text>
              </View>
              <Text style={styles.statLabel}>평균 별점</Text>
              <View style={styles.statDivider} />
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statValueKr} numberOfLines={1}>
                {stats.topCategory}
              </Text>
              <Text style={styles.statLabel}>가장 많이</Text>
            </View>
          </View>

          {/* 검색 + 뷰 토글 */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx={11}
                  cy={11}
                  r={7}
                  stroke={colors.textTertiary}
                  strokeWidth={2}
                />
                <Path
                  d="m20 20-3.5-3.5"
                  stroke={colors.textTertiary}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="요리명 검색"
                placeholderTextColor={colors.textTertiary}
                style={styles.searchInput}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  hitSlop={6}
                  style={styles.searchClear}
                >
                  <Svg width={12} height={12} viewBox="0 0 24 24">
                    <Path
                      d="M18 6L6 18M6 6l12 12"
                      stroke={colors.textTertiary}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                  </Svg>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.viewToggle}>
              <ViewToggleBtn
                active={view === 'card'}
                onPress={() => setView('card')}
                kind="card"
              />
              <ViewToggleBtn
                active={view === 'grid'}
                onPress={() => setView('grid')}
                kind="grid"
              />
            </View>
          </View>

          {/* 정렬 칩 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}
            keyboardShouldPersistTaps="handled"
          >
            <SortChip
              active={sort === 'latest'}
              label="최신순"
              onPress={() => setSort('latest')}
            />
            <SortChip
              active={sort === 'oldest'}
              label="오래된순"
              onPress={() => setSort('oldest')}
            />
            <SortChip
              active={sort === 'rating-desc'}
              label="높은순"
              onPress={() => setSort('rating-desc')}
              withStar
            />
            <SortChip
              active={sort === 'rating-asc'}
              label="낮은순"
              onPress={() => setSort('rating-asc')}
              withStar
            />
          </ScrollView>

          {/* 날짜 필터 버튼 (연도+월 통합) */}
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setSheetOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.dateBtnLeft}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Rect
                  x={3}
                  y={4}
                  width={18}
                  height={18}
                  rx={2}
                  stroke={colors.textSecondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M16 2v4M8 2v4M3 10h18"
                  stroke={colors.textSecondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.dateBtnText}>
                {month != null ? `${year}년 ${month}월` : `${year}년 전체`}
              </Text>
              {month != null && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {monthCounts[month - 1] ?? 0}개
                  </Text>
                </View>
              )}
            </View>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9l6 6 6-6"
                stroke={colors.textTertiary}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* 섹션 헤딩 */}
          <View style={styles.sectionHeading}>
            <View style={styles.highlightWrap}>
              <View style={styles.highlightBg} />
              <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            </View>
            <Text style={styles.sectionSub}>
              · {filtered.length}개의 기록
            </Text>
          </View>

          {/* 리스트 */}
          {filtered.length === 0 ? (
            <View style={styles.filterEmpty}>
              <Text style={{ fontSize: 36 }}>🔍</Text>
              <Text style={styles.filterEmptyTitle}>
                조건에 맞는 기록이 없어요
              </Text>
              <Text style={styles.filterEmptyDesc}>
                다른 월을 선택하거나 검색어를 바꿔보세요
              </Text>
            </View>
          ) : view === 'card' ? (
            <View style={styles.polaroidList}>
              {filtered.map((entry, idx) => (
                <PolaroidCard
                  key={entry.id}
                  entry={entry}
                  rotateDeg={idx % 2 === 0 ? '-0.3deg' : '0.3deg'}
                  isBest={idx === bestIdx}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/cookbook/[id]',
                      params: { id: String(entry.id) },
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <View style={styles.gridList}>
              {filtered.map((entry) => (
                <GridTile
                  key={entry.id}
                  entry={entry}
                  size={gridCellSize}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/cookbook/[id]',
                      params: { id: String(entry.id) },
                    })
                  }
                />
              ))}
            </View>
          )}

          {isFetchingNextPage && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.textTertiary} />
            </View>
          )}
        </ScrollView>
      )}

      <DateFilterSheet
        visible={sheetOpen}
        initialYear={year}
        initialMonth={month}
        years={years}
        allEntries={allEntries}
        cellSize={monthCellSize}
        onSelect={(y, m) => {
          setYear(y);
          setMonth(m);
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

interface ViewToggleBtnProps {
  active: boolean;
  onPress: () => void;
  kind: 'card' | 'grid';
}

function ViewToggleBtn({ active, onPress, kind }: ViewToggleBtnProps) {
  const stroke = active ? '#fff' : colors.textTertiary;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.toggleBtn, active && styles.toggleBtnActive]}
    >
      {kind === 'card' ? (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Rect
            x={3}
            y={3}
            width={18}
            height={18}
            rx={2}
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Rect x={3} y={3} width={7} height={7} rx={1} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
          <Rect x={14} y={3} width={7} height={7} rx={1} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
          <Rect x={3} y={14} width={7} height={7} rx={1} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
          <Rect x={14} y={14} width={7} height={7} rx={1} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      )}
    </TouchableOpacity>
  );
}

interface SortChipProps {
  active: boolean;
  label: string;
  onPress: () => void;
  withStar?: boolean;
}

function SortChip({ active, label, onPress, withStar }: SortChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.sortChip, active && styles.sortChipActive]}
    >
      {withStar && (
        <Svg width={11} height={11} viewBox="0 0 24 24">
          <Path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={STAR_COLOR}
          />
        </Svg>
      )}
      <Text
        style={[styles.sortChipText, active && styles.sortChipTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface PolaroidCardProps {
  entry: CookbookEntry;
  rotateDeg: string;
  isBest: boolean;
  onPress: () => void;
}

function PolaroidCard({ entry, rotateDeg, isBest, onPress }: PolaroidCardProps) {
  const firstPhoto = entry.photoUrls?.[0];
  const photoUrl = toAbsoluteImageUrl(firstPhoto ?? entry.recipeThumbnailUrl);
  const day = new Date(entry.cookedAt).getDate();
  const cat = formatCategory(entry.recipeCategory ?? '').trim();
  const time = formatCookTime(entry.cookingTimeMinutes);
  const diff = formatDifficulty(entry.recipeDifficulty);
  const stars =
    '★'.repeat(Math.max(0, entry.rating)) +
    '☆'.repeat(Math.max(0, 5 - entry.rating));
  const extraPhotos = (entry.photoUrls?.length ?? 0) - 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.polaroid, { transform: [{ rotate: rotateDeg }] }]}
    >
      {isBest && (
        <View style={styles.tape}>
          <Text style={styles.tapeText}>BEST</Text>
        </View>
      )}
      <View style={styles.photoArea}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.photoPlaceholder]}>
            <Text style={{ fontSize: 36 }}>🍽️</Text>
          </View>
        )}
        {extraPhotos > 0 && (
          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountBadgeText}>+{extraPhotos}</Text>
          </View>
        )}
        <Text style={styles.starsOverlay}>{stars}</Text>
      </View>
      <View style={styles.polaroidMetaRow}>
        <Text style={styles.dayLabel}>{day}일</Text>
        <Text style={styles.metaLabel}>
          {cat ? `${cat} · ` : ''}
          {time}
        </Text>
      </View>
      <Text style={styles.recipeLine} numberOfLines={1}>
        {entry.recipeTitle}
        <Text style={styles.recipeMetaTag}>  {diff}</Text>
      </Text>
    </TouchableOpacity>
  );
}

interface GridTileProps {
  entry: CookbookEntry;
  size: number;
  onPress: () => void;
}

function GridTile({ entry, size, onPress }: GridTileProps) {
  const firstPhoto = entry.photoUrls?.[0];
  const photoUrl = toAbsoluteImageUrl(firstPhoto ?? entry.recipeThumbnailUrl);
  const day = new Date(entry.cookedAt).getDate();
  const photoCount = entry.photoUrls?.length ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.gridTile, { width: size, height: size }]}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.photoPlaceholder]}>
          <Text style={{ fontSize: 22 }}>🍽️</Text>
        </View>
      )}
      <View style={styles.gridDay}>
        <Text style={styles.gridDayText}>{day}</Text>
      </View>
      {photoCount > 1 && (
        <View style={styles.gridMulti}>
          <Text style={styles.gridMultiText}>{photoCount}</Text>
        </View>
      )}
      <View style={styles.gridStars}>
        <Svg width={9} height={9} viewBox="0 0 24 24">
          <Path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={STAR_COLOR}
          />
        </Svg>
        <Text style={styles.gridStarsText}>{entry.rating}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface DateFilterSheetProps {
  visible: boolean;
  initialYear: number;
  initialMonth: number | null;
  years: number[];
  allEntries: CookbookEntry[];
  cellSize: number;
  onSelect: (year: number, month: number | null) => void;
  onClose: () => void;
}

function DateFilterSheet({
  visible,
  initialYear,
  initialMonth,
  years,
  allEntries,
  cellSize,
  onSelect,
  onClose,
}: DateFilterSheetProps) {
  const [uiYear, setUiYear] = useState(initialYear);

  // 시트 열 때마다 메인 연도와 동기화
  useEffect(() => {
    if (visible) setUiYear(initialYear);
  }, [visible, initialYear]);

  const yearEntriesUi = useMemo(
    () =>
      allEntries.filter(
        (e) => new Date(e.cookedAt).getFullYear() === uiYear,
      ),
    [allEntries, uiYear],
  );

  const monthCountsUi = useMemo(() => {
    const arr = new Array(12).fill(0);
    yearEntriesUi.forEach((e) => {
      const m = new Date(e.cookedAt).getMonth();
      arr[m] += 1;
    });
    return arr;
  }, [yearEntriesUi]);

  const monthMaxUi = useMemo(
    () => Math.max(1, ...monthCountsUi),
    [monthCountsUi],
  );
  const totalCountUi = yearEntriesUi.length;

  // 활성 표시는 시트가 메인의 현재 연도를 보여줄 때만
  const showingInitialYear = uiYear === initialYear;
  const allActive = showingInitialYear && initialMonth == null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>날짜로 보기</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.sheetClose}
              hitSlop={8}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke={colors.textSecondary}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* 연도 가로 칩 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearStrip}
            keyboardShouldPersistTaps="handled"
          >
            {years.map((y) => {
              const active = y === uiYear;
              return (
                <TouchableOpacity
                  key={y}
                  onPress={() => setUiYear(y)}
                  activeOpacity={0.85}
                  style={[
                    styles.yearChip,
                    active && styles.yearChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.yearChipText,
                      active && styles.yearChipTextActive,
                    ]}
                  >
                    {y}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sheetBody}>
            <TouchableOpacity
              style={[styles.allRow, allActive && styles.allRowActive]}
              onPress={() => onSelect(uiYear, null)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.allLabel,
                  allActive && styles.allLabelActive,
                ]}
              >
                {uiYear}년 전체
              </Text>
              <Text
                style={[
                  styles.allCount,
                  allActive && styles.allCountActive,
                ]}
              >
                {totalCountUi}개
              </Text>
            </TouchableOpacity>

            <View style={styles.monthGrid}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const count = monthCountsUi[m - 1] ?? 0;
                const empty = count === 0;
                const active =
                  showingInitialYear && initialMonth === m;
                const fillPct = Math.round((count / monthMaxUi) * 100);
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => !empty && onSelect(uiYear, m)}
                    activeOpacity={empty ? 1 : 0.85}
                    disabled={empty}
                    style={[
                      styles.monthCell,
                      { width: cellSize },
                      active && styles.monthCellActive,
                      empty && styles.monthCellEmpty,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthName,
                        active && styles.monthNameActive,
                      ]}
                    >
                      {m}월
                    </Text>
                    <Text
                      style={[
                        styles.monthCount,
                        active && styles.monthCountActive,
                      ]}
                    >
                      {count}
                    </Text>
                    <View style={styles.monthBar}>
                      <View
                        style={[
                          styles.monthBarFill,
                          { width: `${fillPct}%` },
                          active && styles.monthBarFillActive,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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
    paddingHorizontal: PAD,
    paddingTop: 12,
    paddingBottom: 8,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptyDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  emptyBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: '#fff' },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: PAD,
    paddingTop: 8,
    paddingBottom: 16,
  },
  statCell: { flex: 1, position: 'relative', paddingHorizontal: 4 },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.textPrimary,
    letterSpacing: -0.6,
    lineHeight: 22,
    marginBottom: 6,
  },
  statValueKr: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 22,
    marginBottom: 6,
  },
  statStar: {
    color: STAR_COLOR,
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  statLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: -0.1,
  },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: 8,
    bottom: 8,
    width: 1,
    backgroundColor: colors.line,
  },

  // Search row
  searchRow: {
    paddingHorizontal: PAD,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textPrimary,
    letterSpacing: -0.1,
    padding: 0,
    height: 38,
  },
  searchClear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lineSoft,
  },
  viewToggle: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 100,
    padding: 4,
    flexDirection: 'row',
    gap: 2,
  },
  toggleBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  toggleBtnActive: { backgroundColor: colors.textPrimary },

  // Sort chips
  sortRow: {
    paddingHorizontal: PAD,
    gap: 6,
    alignItems: 'center',
    paddingVertical: 0,
  },
  sortChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  sortChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  sortChipTextActive: { color: '#fff', fontFamily: fontFamily.bold },

  // Date filter btn
  dateBtn: {
    marginHorizontal: PAD,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    marginLeft: 4,
  },
  countBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
  },

  // Section heading
  sectionHeading: {
    paddingHorizontal: PAD,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  highlightWrap: { position: 'relative' },
  highlightBg: {
    position: 'absolute',
    left: -3,
    right: -3,
    top: '55%',
    bottom: 0,
    backgroundColor: HIGHLIGHT_YELLOW,
    opacity: 0.85,
    transform: [{ skewX: '-2deg' }],
  },
  sectionTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.7,
  },
  sectionSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textTertiary,
    letterSpacing: -0.1,
  },

  // Polaroid
  polaroidList: { paddingHorizontal: PAD, paddingTop: 4, paddingBottom: 8 },
  polaroid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 18,
    marginBottom: 18,
    position: 'relative',
    ...shadow.md,
  },
  photoArea: {
    aspectRatio: 1,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: colors.lineSoft,
    position: 'relative',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lineSoft,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(31,22,18,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  photoCountBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    color: '#fff',
    letterSpacing: -0.1,
  },
  starsOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    color: STAR_COLOR,
    fontSize: 12,
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  polaroidMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  dayLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  metaLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    color: colors.textTertiary,
    letterSpacing: 0.6,
  },
  recipeLine: {
    paddingHorizontal: 4,
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  recipeMetaTag: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textTertiary,
  },
  tape: {
    position: 'absolute',
    top: 12,
    left: 14,
    backgroundColor: TAPE_YELLOW,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 2,
    transform: [{ rotate: '-6deg' }],
    zIndex: 3,
    ...shadow.sm,
  },
  tapeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    color: colors.textPrimary,
    letterSpacing: 1.6,
  },

  // Grid
  gridList: {
    paddingHorizontal: PAD,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingBottom: 12,
  },
  gridTile: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.lineSoft,
    position: 'relative',
  },
  gridDay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(31,22,18,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  gridDayText: {
    fontFamily: fontFamily.bold,
    fontSize: 9.5,
    color: '#fff',
    letterSpacing: -0.1,
  },
  gridMulti: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 18,
    height: 18,
    backgroundColor: 'rgba(31,22,18,0.55)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridMultiText: { fontFamily: fontFamily.bold, fontSize: 9, color: '#fff' },
  gridStars: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingLeft: 5,
    paddingRight: 6,
    paddingVertical: 2,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gridStarsText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 9.5,
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },

  // Filter empty
  filterEmpty: { alignItems: 'center', paddingVertical: 36, gap: 6 },
  filterEmptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 4,
  },
  filterEmptyDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },

  loadingMore: { paddingVertical: 16, alignItems: 'center' },

  // Modal sheet
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(31,22,18,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingBottom: 28,
    ...shadow.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 3,
    marginBottom: 14,
  },
  sheetHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  sheetClose: {
    width: 32,
    height: 32,
    backgroundColor: colors.lineSoft,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Year strip in sheet
  yearStrip: {
    paddingHorizontal: PAD,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 6,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 100,
  },
  yearChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  yearChipText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  yearChipTextActive: { color: '#fff' },

  sheetBody: { paddingHorizontal: PAD, paddingTop: 10, paddingBottom: 8 },

  allRow: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  allRowActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  allLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  allLabelActive: { color: colors.primary },
  allCount: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textTertiary,
  },
  allCountActive: { color: colors.primary },

  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  monthCell: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  monthCellActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  monthCellEmpty: { opacity: 0.35 },
  monthName: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  monthNameActive: { color: colors.primary },
  monthCount: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    color: colors.textTertiary,
  },
  monthCountActive: { color: colors.primary },
  monthBar: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: colors.line,
    borderRadius: 1,
    overflow: 'hidden',
  },
  monthBarFill: {
    height: '100%',
    backgroundColor: colors.textTertiary,
    borderRadius: 1,
  },
  monthBarFillActive: { backgroundColor: colors.primary },
});
