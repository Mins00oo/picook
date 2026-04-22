import React, { useMemo } from 'react';
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
import { colors, fontFamily, shadow, typography } from '../../../src/constants/theme';
import { useCookbookList } from '../../../src/hooks/useCookbook';
import { RatingStars } from '../../../src/components/cookbook/RatingStars';
import { toAbsoluteImageUrl, formatCookTime } from '../../../src/utils/format';
import { Loading } from '../../../src/components/common/Loading';
import type { CookbookEntry } from '../../../src/api/cookbookApi';

export default function CookbookListScreen() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCookbookList();

  const entries = useMemo<CookbookEntry[]>(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );

  if (isLoading) return <Loading />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>내 요리북</Text>
        <View style={{ width: 36 }} />
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📖</Text>
          <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
          <Text style={styles.emptyDesc}>요리 완료 후 평가를 남기면 여기에 쌓여요</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.emptyBtnText}>재료 골라보기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => String(e.id)}
          renderItem={({ item }) => <EntryCard entry={item} onPress={() => router.push({
            pathname: '/(tabs)/cookbook/[id]',
            params: { id: String(item.id) },
          })} />}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function EntryCard({ entry, onPress }: { entry: CookbookEntry; onPress: () => void }) {
  const firstPhoto = entry.photoUrls?.[0];
  const thumb = toAbsoluteImageUrl(firstPhoto ?? entry.recipeThumbnailUrl);
  const date = new Date(entry.cookedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumbWrap}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={{ fontSize: 24 }}>🍽️</Text>
          </View>
        )}
        {entry.photoUrls.length > 1 && (
          <View style={styles.photoCount}>
            <Text style={styles.photoCountText}>+{entry.photoUrls.length - 1}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.title} numberOfLines={1}>{entry.recipeTitle}</Text>
        <View style={styles.metaRow}>
          <RatingStars value={entry.rating} size={13} readonly spacing={1} />
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{formatCookTime(entry.cookingTimeMinutes)}</Text>
        </View>
        {entry.memo && (
          <Text style={styles.memo} numberOfLines={1}>&ldquo;{entry.memo}&rdquo;</Text>
        )}
      </View>
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
  navTitle: { ...typography.h3, fontSize: 16, color: colors.textPrimary, fontFamily: fontFamily.bold },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginTop: 12 },
  emptyDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  emptyBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  emptyBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: '#fff' },

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
  thumb: { width: 84, height: 84, borderRadius: 12, backgroundColor: colors.lineSoft },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  photoCount: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(31,22,18,0.7)',
  },
  photoCountText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#fff',
  },

  body: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 4 },
  date: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textTertiary,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  metaDot: { color: colors.textTertiary, fontSize: 12 },
  memo: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
