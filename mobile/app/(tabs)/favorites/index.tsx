import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SectionList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Colors } from '../../../src/constants/colors';
import { Loading } from '../../../src/components/common/Loading';
import { favoriteApi, FavoriteItem } from '../../../src/api/favoriteApi';
import { shortsApi } from '../../../src/api/shortsApi';
import { formatCookTime, formatDifficulty } from '../../../src/utils/format';
import type { ShortsFavorite } from '../../../src/types/shorts';

type SectionItem = { type: 'recipe'; data: FavoriteItem } | { type: 'shorts'; data: ShortsFavorite };

export default function FavoritesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ─── 레시피 즐겨찾기 ───
  const { data: recipeFavs, isLoading: isLoadingRecipe } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await favoriteApi.getList();
      return res.data.data;
    },
  });

  const removeRecipeMutation = useMutation({
    mutationFn: (favoriteId: number) => favoriteApi.remove(favoriteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  // ─── 쇼츠 즐겨찾기 ───
  const { data: shortsFavs, isLoading: isLoadingShorts } = useQuery({
    queryKey: ['shorts-favorites'],
    queryFn: async () => {
      const res = await shortsApi.getFavorites();
      return res.data.data;
    },
  });

  const removeShortsMutation = useMutation({
    mutationFn: (favoriteId: number) => shortsApi.removeFavorite(favoriteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shorts-favorites'] }),
  });

  const handleRemoveRecipe = (favoriteId: number, title: string) => {
    Alert.alert('즐겨찾기 삭제', `"${title}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeRecipeMutation.mutate(favoriteId) },
    ]);
  };

  const handleRemoveShorts = (favoriteId: number, title: string) => {
    Alert.alert('즐겨찾기 삭제', `"${title}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeShortsMutation.mutate(favoriteId) },
    ]);
  };

  const isLoading = isLoadingRecipe || isLoadingShorts;
  const recipes = recipeFavs ?? [];
  const shorts = shortsFavs ?? [];
  const totalCount = recipes.length + shorts.length;

  // SectionList 데이터
  const sections: { title: string; data: SectionItem[] }[] = [];
  if (recipes.length > 0) {
    sections.push({
      title: `레시피 ${recipes.length}`,
      data: recipes.map((r) => ({ type: 'recipe' as const, data: r })),
    });
  }
  if (shorts.length > 0) {
    sections.push({
      title: `쇼츠 ${shorts.length}`,
      data: shorts.map((s) => ({ type: 'shorts' as const, data: s })),
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>즐겨찾기</Text>
        <Text style={styles.count}>{totalCount}개</Text>
      </View>

      {isLoading ? (
        <Loading message="즐겨찾기를 불러오는 중..." />
      ) : totalCount === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💝</Text>
          <Text style={styles.emptyTitle}>아직 즐겨찾기가 없어요</Text>
          <Text style={styles.emptyDesc}>
            마음에 드는 레시피에 하트를 눌러보세요
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) =>
            item.type === 'recipe'
              ? `recipe-${item.data.id}`
              : `shorts-${item.data.id}`
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) =>
            item.type === 'recipe'
              ? renderRecipeCard(item.data)
              : renderShortsCard(item.data)
          }
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );

  // ─── 레시피 카드 ───
  function renderRecipeCard(item: FavoriteItem) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tabs)/recipe/${item.recipeId}`)}
        activeOpacity={0.7}
      >
        {item.recipeThumbnailUrl ? (
          <Image source={{ uri: item.recipeThumbnailUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={styles.placeholderEmoji}>🍽️</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.recipeTitle}
          </Text>
          <Text style={styles.cardMeta}>
            {formatCookTime(item.cookingTimeMinutes)} · {formatDifficulty(item.recipeDifficulty)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveRecipe(item.id, item.recipeTitle)}
        >
          <Text style={styles.removeText}>❤️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ─── 쇼츠 카드 ───
  function renderShortsCard(item: ShortsFavorite) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({ pathname: '/(tabs)/shorts/result', params: { id: String(item.shortsCacheId) } })
        }
        activeOpacity={0.7}
      >
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={styles.placeholderEmoji}>🎬</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardMeta}>
            {item.channelName ? `${item.channelName} · ` : ''}쇼츠 변환
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveShorts(item.id, item.title)}
        >
          <Text style={styles.removeText}>❤️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
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
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  count: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 14,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  cardImagePlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  cardMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  removeBtn: {
    padding: 8,
  },
  removeText: {
    fontSize: 20,
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
