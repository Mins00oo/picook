import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Colors } from '../../../../src/constants/colors';
import { cookingApi } from '../../../../src/api/cookingApi';
import type { CookingHistoryDetail, CoachingPhoto } from '../../../../src/types/cooking';
import { toAbsoluteImageUrl } from '../../../../src/utils/format';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_HEIGHT = 300;

function formatDetailDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return year + '년 ' + month + '월 ' + day + '일 ' + hours + ':' + minutes;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return m + '분';
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? h + '시간 ' + rem + '분' : h + '시간';
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 'single':
      return '추천 레시피';
    case 'multi':
      return '멀티 코칭';
    case 'shorts':
      return '쇼츠 변환';
    default:
      return '추천 레시피';
  }
}

export default function CookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList<CoachingPhoto>>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPhotoIndex(viewableItems[0].index ?? 0);
    }
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const { data: detail, isLoading, isError, refetch } = useQuery({
    queryKey: ['cooking-detail', id],
    queryFn: async () => {
      const res = await cookingApi.getHistoryDetail(Number(id));
      return res.data.data;
    },
    enabled: !!id,
  });

  const handleRemake = () => {
    Alert.alert('다시 만들기', '이 기능은 준비 중입니다.');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>요리 기록</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !detail) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>요리 기록</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>{'😔'}</Text>
          <Text style={styles.errorTitle}>기록을 불러올 수 없어요</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photos = detail.photos ?? [];
  const hasPhotos = photos.length > 0;
  const showIndicator = photos.length > 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>요리 기록</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo gallery */}
        {hasPhotos && (
          <View style={styles.galleryContainer}>
            <FlatList
              ref={flatListRef}
              data={photos}
              keyExtractor={(item) => String(item.id)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={({ item }: { item: CoachingPhoto }) => (
                <Image
                  source={{ uri: toAbsoluteImageUrl(item.photoUrl) ?? '' }}
                  style={styles.galleryPhoto}
                  contentFit="cover"
                />
              )}
            />
            {showIndicator && (
              <View style={styles.dotContainer}>
                {photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentPhotoIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Recipe name */}
        <Text style={styles.recipeName}>{detail.title}</Text>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{'📅'}</Text>
            <Text style={styles.infoLabel}>완료:</Text>
            <Text style={styles.infoValue}>{formatDetailDate(detail.completedAt)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{'⏱️'}</Text>
            <Text style={styles.infoLabel}>소요:</Text>
            <Text style={styles.infoValue}>
              {formatDuration(detail.actualSeconds)}
              {detail.estimatedSeconds > 0
                ? ' (예상 ' + formatDuration(detail.estimatedSeconds) + ')'
                : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{'📝'}</Text>
            <Text style={styles.infoLabel}>출처:</Text>
            <Text style={styles.infoValue}>{getModeLabel(detail.mode)}</Text>
          </View>
        </View>

        {/* Bottom button */}
        <TouchableOpacity style={styles.remakeButton} onPress={handleRemake}>
          <Text style={styles.remakeButtonText}>다시 만들기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: Colors.text,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },

  // Center layout (loading / error)
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Scroll
  scrollContent: {
    paddingBottom: 40,
  },

  // Photo gallery
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
    marginBottom: 20,
  },
  galleryPhoto: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },

  // Recipe name
  recipeName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Info card
  infoCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 44,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },

  // Remake button
  remakeButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  remakeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
