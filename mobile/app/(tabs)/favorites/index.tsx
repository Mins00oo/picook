import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Colors } from '../../../src/constants/colors';
import { Loading } from '../../../src/components/common/Loading';
import { favoriteApi, FavoriteItem } from '../../../src/api/favoriteApi';
import { formatCookTime, formatDifficulty } from '../../../src/utils/format';

export default function FavoritesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await favoriteApi.getList();
      return res.data.data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: (favoriteId: number) => favoriteApi.remove(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleRemove = (favoriteId: number, title: string) => {
    Alert.alert('즐겨찾기 삭제', `"${title}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeMutation.mutate(favoriteId) },
    ]);
  };

  const favorites = data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>즐겨찾기</Text>
        <Text style={styles.count}>{favorites.length}개</Text>
      </View>

      {isLoading ? (
        <Loading message="즐겨찾기를 불러오는 중..." />
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💝</Text>
          <Text style={styles.emptyTitle}>아직 즐겨찾기가 없어요</Text>
          <Text style={styles.emptyDesc}>
            마음에 드는 레시피에 하트를 눌러보세요
          </Text>
        </View>
      ) : (
        <FlashList
          data={favorites}
          keyExtractor={(item: FavoriteItem) => String(item.id)}
          renderItem={({ item }: { item: FavoriteItem }) => (
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
                onPress={() => handleRemove(item.id, item.recipeTitle)}
              >
                <Text style={styles.removeText}>❤️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
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
    padding: 20,
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
