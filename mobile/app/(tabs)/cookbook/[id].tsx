import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, typography } from '../../../src/constants/theme';
import { useCookbookDetail } from '../../../src/hooks/useCookbook';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { RatingStars } from '../../../src/components/cookbook/RatingStars';
import { formatCookTime, formatDifficulty, toAbsoluteImageUrl } from '../../../src/utils/format';

export default function CookbookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useCookbookDetail(Number(id));
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorScreen />;

  const date = new Date(data.cookedAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>요리 기록</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.title}>{data.recipeTitle}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{formatCookTime(data.cookingTimeMinutes)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{formatDifficulty(data.recipeDifficulty)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{data.recipeCategory}</Text>
          </View>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.cardLabel}>나의 평가</Text>
          <RatingStars value={data.rating} size={28} readonly spacing={6} />
        </View>

        {data.photoUrls.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>사진</Text>
            <View style={styles.photoGrid}>
              {data.photoUrls.map((u, i) => {
                const uri = toAbsoluteImageUrl(u);
                if (!uri) return null;
                return (
                  <TouchableOpacity
                    key={`${u}_${i}`}
                    style={styles.photoCell}
                    onPress={() => setZoomPhoto(uri)}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {data.memo && (
          <View>
            <Text style={styles.sectionLabel}>메모</Text>
            <View style={styles.memoCard}>
              <Text style={styles.memoText}>{data.memo}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => router.push({ pathname: `/(tabs)/recipe/${data.recipeId}` as any })}
          activeOpacity={0.8}
        >
          <Text style={styles.linkText}>원본 레시피 보기</Text>
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Path d="M9 18l6-6-6-6" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
      </ScrollView>

      {/* Zoom modal */}
      <Modal visible={!!zoomPhoto} animationType="fade" transparent onRequestClose={() => setZoomPhoto(null)}>
        <Pressable style={styles.zoomBackdrop} onPress={() => setZoomPhoto(null)}>
          {zoomPhoto && (
            <Image source={{ uri: zoomPhoto }} style={styles.zoomPhoto} contentFit="contain" />
          )}
          <TouchableOpacity style={styles.zoomClose} onPress={() => setZoomPhoto(null)}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path d="M6 6l12 12M6 18l12-12" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </Pressable>
      </Modal>
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

  header: { gap: 4 },
  date: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textTertiary,
  },
  title: { ...typography.heroTitle, fontSize: 24, color: colors.textPrimary, marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: { color: colors.textTertiary, fontSize: 12 },

  ratingCard: {
    padding: 16,
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    gap: 8,
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.8,
  },

  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  photoCell: {
    width: '23.5%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },

  memoCard: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  memoText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  linkText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.primary,
  },

  zoomBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomPhoto: { width: '100%', height: '80%' },
  zoomClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
