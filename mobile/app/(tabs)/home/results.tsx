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
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Colors } from '../../../src/constants/colors';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { recipeApi } from '../../../src/api/recipeApi';
import { useSelectionStore } from '../../../src/stores/selectionStore';
import { useFilterStore } from '../../../src/stores/filterStore';
import { formatCookTime, formatDifficulty, formatMatchRate } from '../../../src/utils/format';
import type { RecipeSummary } from '../../../src/types/recipe';

export default function ResultsScreen() {
  const router = useRouter();
  const { getIds } = useSelectionStore();
  const { maxCookTimeMinutes, difficulty, servings } = useFilterStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommend', getIds(), maxCookTimeMinutes, difficulty, servings],
    queryFn: async () => {
      const res = await recipeApi.recommend({
        ingredientIds: getIds(),
        maxCookTimeMinutes: maxCookTimeMinutes ?? undefined,
        difficulty: difficulty ?? undefined,
        servings: servings ?? undefined,
      });
      return res.data.data;
    },
  });

  if (isLoading) return <Loading message="레시피를 찾는 중..." />;
  if (error) return <ErrorScreen message="추천 결과를 불러오지 못했습니다" onRetry={() => refetch()} />;

  const recipes = data?.recipes ?? [];

  const renderRecipe = ({ item }: { item: RecipeSummary }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/recipe/${item.id}`)}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={styles.placeholderEmoji}>🍽️</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>{formatCookTime(item.cookTimeMinutes)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{formatDifficulty(item.difficulty)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{item.servings}인분</Text>
        </View>
        {item.matchRate != null && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>
              매칭률 {formatMatchRate(item.matchRate)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>추천 결과</Text>
        <View style={{ width: 50 }} />
      </View>

      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>😅</Text>
          <Text style={styles.emptyTitle}>추천 결과가 없어요</Text>
          <Text style={styles.emptyDesc}>
            재료를 더 추가하거나 필터를 변경해보세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRecipe}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  list: {
    padding: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  cardImage: {
    width: 110,
    height: 110,
  },
  cardImagePlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  metaDot: {
    color: Colors.textTertiary,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
