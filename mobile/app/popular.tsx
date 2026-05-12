import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../src/constants/theme';
import { formatCookTime, formatDifficulty, toAbsoluteImageUrl } from '../src/utils/format';
import type { PopularRecipe } from '../src/types/recipe';

const CATEGORY_LABEL: Record<string, string> = {
  korean: '한식',
  western: '양식',
  japanese: '일식',
  other: '기타',
};

const RANK_BADGE: Record<number, { emoji: string; bg: string; fg: string }> = {
  0: { emoji: '🥇', bg: '#FFF4D6', fg: '#8B6B00' },
  1: { emoji: '🥈', bg: '#EFEFEF', fg: '#595959' },
  2: { emoji: '🥉', bg: '#F8E2C8', fg: '#7A4A1F' },
};

// TODO: 백엔드 /api/v1/recipes/popular 구현되면 usePopularRecipes 훅으로 교체.
//       지금은 UI 검증용 더미. recipe.id는 가짜라서 카드 탭 시 상세 진입은 404 가능.
const MOCK_POPULAR: PopularRecipe[] = [
  { id: 1001, title: '김치찌개', category: 'korean',   difficulty: 'EASY',   cookingTimeMinutes: 30, servings: 2, imageUrl: null, thumbnailUrl: null, cookCount: 1247 },
  { id: 1002, title: '까르보나라', category: 'western', difficulty: 'MEDIUM', cookingTimeMinutes: 25, servings: 2, imageUrl: null, thumbnailUrl: null, cookCount: 892 },
  { id: 1003, title: '연어 초밥',  category: 'japanese', difficulty: 'HARD',   cookingTimeMinutes: 40, servings: 2, imageUrl: null, thumbnailUrl: null, cookCount: 654 },
  { id: 1004, title: '제육볶음',   category: 'korean',   difficulty: 'EASY',   cookingTimeMinutes: 20, servings: 2, imageUrl: null, thumbnailUrl: null, cookCount: 432 },
  { id: 1005, title: '마르게리타 피자', category: 'western', difficulty: 'MEDIUM', cookingTimeMinutes: 45, servings: 3, imageUrl: null, thumbnailUrl: null, cookCount: 318 },
  { id: 1006, title: '규동',       category: 'japanese', difficulty: 'EASY',   cookingTimeMinutes: 18, servings: 1, imageUrl: null, thumbnailUrl: null, cookCount: 287 },
  { id: 1007, title: '비빔밥',     category: 'korean',   difficulty: 'MEDIUM', cookingTimeMinutes: 25, servings: 2, imageUrl: null, thumbnailUrl: null, cookCount: 245 },
  { id: 1008, title: '토마토 파스타', category: 'western', difficulty: 'EASY',   cookingTimeMinutes: 20, servings: 2, imageUrl: null, thumbnailUrl: null, cookCount: 198 },
  { id: 1009, title: '미소시루',   category: 'japanese', difficulty: 'EASY',   cookingTimeMinutes: 12, servings: 2, imageUrl: null, thumbnailUrl: null, cookCount: 156 },
  { id: 1010, title: '떡볶이',     category: 'korean',   difficulty: 'EASY',   cookingTimeMinutes: 25, servings: 2, imageUrl: null, thumbnailUrl: null, cookCount: 134 },
];

export default function PopularScreen() {
  const router = useRouter();
  const list = MOCK_POPULAR;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>인기 요리</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.subhead}>
        <View style={styles.subPill}>
          <Text style={styles.subPillText}>🔥 요리 인증이 많은 순</Text>
        </View>
      </View>

      {list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🍳</Text>
          <Text style={styles.emptyTitle}>아직 인기 요리가 없어요</Text>
          <Text style={styles.emptyDesc}>요리북 인증이 쌓이면 여기에 표시돼요</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(r) => String(r.id)}
          renderItem={({ item, index }) => (
            <PopularCard
              recipe={item}
              rank={index}
              onPress={() => router.push(`/recipe/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function PopularCard({
  recipe,
  rank,
  onPress,
}: {
  recipe: PopularRecipe;
  rank: number;
  onPress: () => void;
}) {
  const thumb = toAbsoluteImageUrl(recipe.thumbnailUrl ?? recipe.imageUrl);
  const badge = RANK_BADGE[rank];
  const categoryLabel = CATEGORY_LABEL[recipe.category] ?? recipe.category;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumbWrap}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={{ fontSize: 28 }}>🍽️</Text>
          </View>
        )}
        {badge ? (
          <View style={[styles.rankBadge, { backgroundColor: badge.bg }]}>
            <Text style={styles.rankEmoji}>{badge.emoji}</Text>
          </View>
        ) : (
          <View style={styles.rankNumberBadge}>
            <Text style={styles.rankNumberText}>{rank + 1}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{recipe.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatCookTime(recipe.cookingTimeMinutes)} · {formatDifficulty(recipe.difficulty)} · {categoryLabel}
        </Text>
        <View style={styles.cookCountRow}>
          <Text style={styles.cookCountEmoji}>👩‍🍳</Text>
          <Text style={styles.cookCountText}>
            <Text style={styles.cookCountNum}>{recipe.cookCount.toLocaleString()}</Text>명이 만들었어요
          </Text>
        </View>
      </View>

      <Svg width={14} height={14} viewBox="0 0 24 24" style={styles.chev}>
        <Path d="M9 18l6-6-6-6" stroke={colors.textTertiary} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  navTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.textPrimary },

  subhead: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subPill: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 100,
    backgroundColor: colors.accentSoft,
  },
  subPillText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: -0.2,
  },

  listContent: { padding: 16, gap: 10, paddingBottom: 40 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    ...shadow.sm,
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.lineSoft },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  rankEmoji: { fontSize: 15, lineHeight: 18 },
  rankNumberBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    minWidth: 26,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inkDark,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  rankNumberText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  info: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 4 },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  meta: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  cookCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cookCountEmoji: { fontSize: 12 },
  cookCountText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: -0.1,
  },
  cookCountNum: {
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },

  chev: { marginRight: 4 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginTop: 12 },
  emptyDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
