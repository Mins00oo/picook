import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow } from '../src/constants/theme';
import { Loading } from '../src/components/common/Loading';
import { ErrorScreen } from '../src/components/common/ErrorScreen';
import { useTimeRecipes } from '../src/hooks/useTimeRecipes';
import { getCurrentPeriod, TIME_COPY } from '../src/utils/timePeriod';
import { getTimeRecipeSessionSeed } from '../src/utils/timeRecipeSessionSeed';
import {
  formatCookTime,
  formatDifficulty,
  toAbsoluteImageUrl,
} from '../src/utils/format';
import type { TimePeriod } from '../src/api/recipeApi';
import type { RecipeSummary } from '../src/types/recipe';

function isTimePeriod(value: unknown): value is TimePeriod {
  return value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'midnight';
}

export default function TimeRecipesScreen() {
  const router = useRouter();
  const { period: periodParam } = useLocalSearchParams<{ period?: string }>();
  const period = isTimePeriod(periodParam) ? periodParam : getCurrentPeriod();
  const timeRecipeSeed = React.useMemo(() => getTimeRecipeSessionSeed(), []);
  const copy = TIME_COPY[period];
  const { data, isLoading, error, refetch } = useTimeRecipes(period, 50, timeRecipeSeed);
  const recipes = data ?? [];

  if (isLoading) return <Loading />;
  if (error) {
    return (
      <ErrorScreen
        message="추천 메뉴를 불러오지 못했어요"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.75}>
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
        <Text style={styles.navTitle}>{copy.sectionTitle}</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{copy.recommendationHint}</Text>
        <Text style={styles.headerMeta}>총 {recipes.length.toLocaleString()}개</Text>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>준비된 추천 메뉴가 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(recipe) => String(recipe.id)}
          renderItem={({ item }) => (
            <RecipeRow
              recipe={item}
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

function RecipeRow({ recipe, onPress }: { recipe: RecipeSummary; onPress: () => void }) {
  const thumb = toAbsoluteImageUrl(recipe.thumbnailUrl ?? recipe.imageUrl);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {thumb ? (
        <Image source={{ uri: thumb }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Text style={styles.thumbText}>사진 없음</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{recipe.title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {formatCookTime(recipe.cookingTimeMinutes)} · {formatDifficulty(recipe.difficulty)}
        </Text>
      </View>
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path
          d="M9 18l6-6-6-6"
          stroke={colors.textTertiary}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
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
  iconButton: {
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 27,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  headerMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: -0.2,
    marginTop: 5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.sm,
  },
  thumb: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: colors.lineSoft,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: -0.2,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
});
