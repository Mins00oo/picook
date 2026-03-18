import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Colors } from '../../../src/constants/colors';
import { useAuthStore } from '../../../src/stores/authStore';
import { cookingApi } from '../../../src/api/cookingApi';
import type { CookingHistoryItem, CookingStats } from '../../../src/types/cooking';
import { getLevelForCount, getLevelProgress, getNextLevel } from '../../../src/constants/levels';
import { toAbsoluteImageUrl } from '../../../src/utils/format';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const CARD_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

interface HistorySection {
  title: string;
  data: CookingHistoryItem[][];
}

function groupByMonth(items: CookingHistoryItem[]): HistorySection[] {
  const map = new Map<string, CookingHistoryItem[]>();

  for (const item of items) {
    const date = new Date(item.completedAt);
    const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  const sections: HistorySection[] = [];
  for (const [key, list] of map) {
    const [year, month] = key.split('-');
    const rows: CookingHistoryItem[][] = [];
    for (let i = 0; i < list.length; i += 2) {
      rows.push(list.slice(i, i + 2));
    }
    sections.push({
      title: '📅 ' + year + '년 ' + parseInt(month, 10) + '월',
      data: rows,
    });
  }

  return sections;
}

function formatFirstCookingDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return '첫 요리: ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
}

function formatCompletedDate(dateStr: string): string {
  const d = new Date(dateStr);
  return (d.getMonth() + 1) + '/' + d.getDate();
}

export default function CookingHistoryScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const statsQuery = useQuery({
    queryKey: ['cooking-stats'],
    queryFn: async () => {
      const res = await cookingApi.getStats();
      return res.data.data;
    },
  });

  const historyQuery = useQuery({
    queryKey: ['cooking-history'],
    queryFn: async () => {
      const res = await cookingApi.getHistory(0, 100);
      return res.data.data;
    },
  });

  const stats: CookingStats | undefined = statsQuery.data;
  const historyItems = historyQuery.data?.content ?? [];
  const sections = useMemo(() => groupByMonth(historyItems), [historyItems]);

  const isLoading = statsQuery.isLoading || historyQuery.isLoading;

  const count = user?.completedCookingCount ?? stats?.totalCompleted ?? 0;
  const level = stats
    ? { level: stats.currentLevel, title: stats.currentTitle, emoji: stats.currentEmoji, min: 0 }
    : getLevelForCount(count);
  const progress = getLevelProgress(count);
  const nextLevel = getNextLevel(getLevelForCount(count));

  const renderStatsHeader = () => (
    <View style={styles.statsContainer}>
      {/* Total completed */}
      <View style={styles.totalCard}>
        <Text style={styles.totalEmoji}>{'🍳'}</Text>
        <Text style={styles.totalLabel}>
          {'총 '}
          <Text style={styles.totalNumber}>{stats?.totalCompleted ?? 0}</Text>
          {'개 요리 완성'}
        </Text>
      </View>

      {/* Level card */}
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelEmoji}>{level.emoji}</Text>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>
              Lv.{level.level} {level.title}
            </Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressBar, { width: `${progress}%` as any }]} />
            </View>
            <Text style={styles.progressText}>
              {nextLevel
                ? `다음 등급까지 ${nextLevel.min - count}회`
                : '최고 등급 달성!'}
            </Text>
          </View>
        </View>
      </View>

      {/* Photo count */}
      {stats && stats.totalPhotos > 0 && (
        <Text style={styles.captionText}>
          {'📸 총 ' + stats.totalPhotos + '장의 요리 사진'}
        </Text>
      )}

      {/* First cooking date */}
      {stats?.firstCookingDate && (
        <Text style={styles.captionGray}>
          {formatFirstCookingDate(stats.firstCookingDate)}
        </Text>
      )}
    </View>
  );

  const renderHistoryCard = (item: CookingHistoryItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.gridCard}
      activeOpacity={0.7}
      onPress={() => router.push(('/(tabs)/mypage/cooking-detail/' + item.id) as any)}
    >
      <View style={styles.gridImageWrapper}>
        {(item.thumbnailUrl || (item.photos && item.photos.length > 0)) ? (
          <Image
            source={{ uri: toAbsoluteImageUrl(item.thumbnailUrl ?? item.photos?.[0]?.photoUrl) ?? '' }}
            style={styles.gridImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.gridImage, styles.gridImagePlaceholder]}>
            <Text style={styles.placeholderEmoji}>{'🍳'}</Text>
          </View>
        )}
        {item.photos.length > 1 && (
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeText}>{'📷 ' + item.photos.length}</Text>
          </View>
        )}
        {item.wasLevelUp && (
          <View style={styles.levelUpBadge}>
            <Text style={styles.levelUpBadgeText}>{'🎉'}</Text>
          </View>
        )}
      </View>
      <Text style={styles.gridTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.gridDate}>{formatCompletedDate(item.completedAt)}</Text>
    </TouchableOpacity>
  );

  const renderRow = ({ item }: { item: CookingHistoryItem[] }) => (
    <View style={styles.gridRow}>
      {item.map((historyItem) => renderHistoryCard(historyItem))}
      {item.length === 1 && <View style={{ width: CARD_WIDTH }} />}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: HistorySection }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (historyItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>요리 기록</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>{'🍳'}</Text>
          <Text style={styles.emptyTitle}>아직 완성한 요리가 없어요</Text>
          <Text style={styles.emptyDesc}>
            레시피를 보고 요리에 도전해보세요!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.emptyButtonText}>레시피 둘러보기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>요리 기록</Text>
        <View style={styles.backBtn} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => 'row-' + index}
        renderItem={renderRow}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderStatsHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
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

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Stats header
  statsContainer: {
    paddingHorizontal: CARD_PADDING,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  totalEmoji: {
    fontSize: 32,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.text,
  },
  totalNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Level card
  levelCard: {
    backgroundColor: '#FFF5F0',
    padding: 20,
    borderRadius: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelEmoji: {
    fontSize: 48,
  },
  levelInfo: {
    flex: 1,
    gap: 8,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Captions
  captionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingLeft: 4,
  },
  captionGray: {
    fontSize: 13,
    color: Colors.textTertiary,
    paddingLeft: 4,
  },

  // Section list
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: CARD_PADDING,
    paddingTop: 20,
    paddingBottom: 8,
  },

  // Grid
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: CARD_PADDING,
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  gridCard: {
    width: CARD_WIDTH,
    gap: 6,
  },
  gridImageWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },

  // Badges
  photoBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  photoBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  levelUpBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelUpBadgeText: {
    fontSize: 14,
  },

  // Card text
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  gridDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
