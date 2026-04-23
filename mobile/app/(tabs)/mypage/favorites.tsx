import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../../../src/constants/theme';
import { useFavorites } from '../../../src/hooks/useFavorites';
import { formatCookTime, formatDifficulty, toAbsoluteImageUrl } from '../../../src/utils/format';
import type { FavoriteItem } from '../../../src/api/favoriteApi';

export default function FavoritesScreen() {
  const router = useRouter();
  const { data: favorites, isLoading, remove } = useFavorites();

  const handleRemove = (item: FavoriteItem) => {
    Alert.alert('찜 해제', `"${item.recipeTitle}"을(를) 찜 목록에서 제거할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '해제',
        style: 'destructive',
        onPress: () => remove.mutate(item.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>찜한 요리</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? null : !favorites || favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🤍</Text>
          <Text style={styles.emptyTitle}>아직 찜한 요리가 없어요</Text>
          <Text style={styles.emptyDesc}>레시피에서 북마크 아이콘을 탭해 저장해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(f) => String(f.id)}
          renderItem={({ item }) => {
            const thumb = toAbsoluteImageUrl(item.recipeThumbnailUrl);
            return (
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.cardMain}
                  onPress={() => router.push({ pathname: `/recipe/${item.recipeId}` as any })}
                  activeOpacity={0.85}
                >
                  {thumb ? (
                    <Image source={{ uri: thumb }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                      <Text style={{ fontSize: 24 }}>🍽️</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
                    <Text style={styles.title} numberOfLines={1}>{item.recipeTitle}</Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {formatCookTime(item.cookingTimeMinutes)} · {formatDifficulty(item.recipeDifficulty)} · {item.recipeCategory}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.heartBtn} onPress={() => handleRemove(item)} hitSlop={8}>
                  <Svg width={18} height={18} viewBox="0 0 24 24">
                    <Path
                      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                      fill={colors.primary}
                      stroke={colors.primary}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginTop: 12 },
  emptyDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.sm,
  },
  cardMain: { flex: 1, flexDirection: 'row', gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.lineSoft },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.textPrimary, letterSpacing: -0.3 },
  meta: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textSecondary, marginTop: 3 },
  heartBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
