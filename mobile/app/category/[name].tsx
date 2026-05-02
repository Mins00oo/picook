import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow } from '../../src/constants/theme';
import { Loading } from '../../src/components/common/Loading';
import { ErrorScreen } from '../../src/components/common/ErrorScreen';
import { useCategoryRecipes } from '../../src/hooks/useCategoryRecipes';
import {
  formatCookTime,
  formatDifficulty,
  toAbsoluteImageUrl,
} from '../../src/utils/format';
import type { RecipeSummary } from '../../src/types/recipe';
import type { RecipeCategory } from '../../src/api/recipeApi';

const META: Record<RecipeCategory, { label: string; emoji: string; bg: string; accent: string }> = {
  korean:   { label: '한식', emoji: '🍚', bg: colors.peach, accent: '#C44A1C' },
  western:  { label: '양식', emoji: '🍝', bg: colors.blue,  accent: '#2F4E7A' },
  japanese: { label: '일식', emoji: '🍣', bg: colors.lilac, accent: '#5E4683' },
  other:    { label: '기타', emoji: '🍴', bg: colors.mint,  accent: '#2E5D2A' },
};

function isValidCategory(v: string | undefined): v is RecipeCategory {
  return v === 'korean' || v === 'western' || v === 'japanese' || v === 'other';
}

export default function CategoryScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const category = isValidCategory(name) ? name : null;
  const meta = category ? META[category] : null;

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCategoryRecipes(category);

  const recipes = useMemo<RecipeSummary[]>(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );
  const totalElements = data?.pages[0]?.totalElements ?? 0;

  if (!category || !meta) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavBar title="카테고리" onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>❓</Text>
          <Text style={styles.emptyTitle}>존재하지 않는 카테고리예요</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) return <Loading />;
  if (error) return <ErrorScreen onRetry={() => refetch()} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavBar title={`${meta.label} 요리`} onBack={() => router.back()} />

      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: meta.bg }]}>
        <Text style={styles.heroEmoji}>{meta.emoji}</Text>
        <View style={styles.heroText}>
          <Text style={[styles.heroLabel, { color: meta.accent }]}>{meta.label}</Text>
          <Text style={[styles.heroCount, { color: meta.accent }]}>
            총 {totalElements.toLocaleString()}개의 요리
          </Text>
        </View>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>아직 등록된 요리가 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(r) => String(r.id)}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => router.push(`/recipe/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.textTertiary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function NavBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.nav}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d="M15 18l-6-6 6-6"
            stroke={colors.textPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.navTitle}>{title}</Text>
      <View style={styles.iconBtn} />
    </View>
  );
}

function RecipeCard({ recipe, onPress }: { recipe: RecipeSummary; onPress: () => void }) {
  const thumb = toAbsoluteImageUrl(recipe.thumbnailUrl ?? recipe.imageUrl);
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
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{recipe.title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {formatCookTime(recipe.cookingTimeMinutes)} · {formatDifficulty(recipe.difficulty)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    padding: 18,
    borderRadius: 18,
  },
  heroEmoji: { fontSize: 40 },
  heroText: { flex: 1 },
  heroLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    letterSpacing: -0.7,
  },
  heroCount: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    letterSpacing: -0.2,
    marginTop: 4,
    opacity: 0.85,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.sm,
  },
  thumbWrap: { position: 'relative' },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: colors.lineSoft,
  },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 4 },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 8,
  },

  footer: { paddingVertical: 16, alignItems: 'center' },
});
