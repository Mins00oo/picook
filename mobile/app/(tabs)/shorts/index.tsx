import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Swipeable } from 'react-native-gesture-handler';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadow,
} from '../../../src/constants/theme';
import { Button } from '../../../src/components/common/Button';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { shortsApi } from '../../../src/api/shortsApi';
import { isValidShortsUrl } from '../../../src/utils/validation';
import type { ShortsHistory } from '../../../src/types/shorts';

/** 상대 시간 포맷 */
function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return '어제';
  if (diffDay < 30) return `${diffDay}일 전`;
  return new Date(dateString).toLocaleDateString('ko-KR');
}

export default function ShortsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  // ─── Queries ───
  const { data: historyData } = useQuery({
    queryKey: ['shorts-history'],
    queryFn: async () => {
      const res = await shortsApi.getRecent();
      return res.data.data;
    },
  });

  // ─── Mutations ───
  const convertMutation = useMutation({
    mutationFn: async (inputUrl: string) => {
      const res = await shortsApi.convert(inputUrl);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['shorts', String(data.cacheId)], data);
      queryClient.invalidateQueries({ queryKey: ['shorts-history'] });
      router.push({ pathname: '/(tabs)/shorts/result', params: { id: String(data.cacheId) } });
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      const messages: Record<string, string> = {
        INVALID_YOUTUBE_URL: '유튜브 쇼츠 URL을 입력해주세요.',
        AUDIO_EXTRACTION_FAILED: '영상 음성을 추출할 수 없어요.',
        NO_AUDIO_CONTENT: '음성이 없는 영상이에요.',
        NOT_COOKING_VIDEO: '요리 영상이 아닌 것 같아요.',
        CONVERSION_TIMEOUT: '변환 시간이 너무 오래 걸려요. 다시 시도해주세요.',
        RATE_LIMIT_EXCEEDED: '요청이 너무 많아요. 잠시 후 시도해주세요.',
      };
      Alert.alert('오류', messages[code] ?? '변환에 실패했어요. 다시 시도해주세요.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (historyId: number) => shortsApi.deleteHistory(historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts-history'] });
      Alert.alert('완료', '변환 기록을 삭제했어요');
    },
    onError: () => {
      Alert.alert('오류', '삭제에 실패했어요');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => shortsApi.deleteAllHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts-history'] });
    },
  });

  // ─── Derived state ───
  const hasInput = url.trim().length > 0;
  const isValid = isValidShortsUrl(url);
  const showUrlError = hasInput && !isValid;

  // URL 중복 제거: 같은 youtubeUrl은 최신 1건만
  const uniqueHistory = useMemo(() => {
    const list = historyData ?? [];
    return list.filter(
      (item: ShortsHistory, idx: number, arr: ShortsHistory[]) =>
        arr.findIndex((x: ShortsHistory) => x.youtubeUrl === item.youtubeUrl) === idx,
    );
  }, [historyData]);

  // ─── Handlers ───
  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text) {
      Alert.alert('알림', '복사된 URL이 없어요.');
      return;
    }
    setUrl(text);
  };

  const handleConvert = () => {
    if (!isValid) {
      Alert.alert('알림', '유효한 유튜브 쇼츠 URL을 입력해주세요.');
      return;
    }
    convertMutation.mutate(url);
  };

  const handleDeleteOne = useCallback((item: ShortsHistory) => {
    swipeableRefs.current.get(item.cacheId)?.close();
    deleteMutation.mutate(item.cacheId);
  }, [deleteMutation]);

  const handleDeleteAll = useCallback(() => {
    Alert.alert(
      '전체 삭제',
      '모든 변환 기록을 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteAllMutation.mutate(),
        },
      ],
    );
  }, [deleteAllMutation]);

  // ─── Swipe delete action ───
  const renderRightActions = useCallback(
    (item: ShortsHistory) =>
      (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = dragX.interpolate({
          inputRange: [-80, 0],
          outputRange: [1, 0.5],
          extrapolate: 'clamp',
        });

        return (
          <TouchableOpacity
            style={styles.swipeDeleteBtn}
            onPress={() => handleDeleteOne(item)}
            activeOpacity={0.7}
          >
            <Animated.Text style={[styles.swipeDeleteText, { transform: [{ scale }] }]}>
              삭제
            </Animated.Text>
          </TouchableOpacity>
        );
      },
    [handleDeleteOne],
  );

  // ─── Card render ───
  const renderHistoryCard = useCallback(
    ({ item }: { item: ShortsHistory }) => (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current.set(item.cacheId, ref);
          else swipeableRefs.current.delete(item.cacheId);
        }}
        renderRightActions={renderRightActions(item)}
        overshootRight={false}
        rightThreshold={40}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/shorts/result',
              params: { id: String(item.cacheId) },
            })
          }
        >
          {/* Thumbnail */}
          <View style={styles.thumbnailBox}>
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={styles.thumbnail}
                contentFit="cover"
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Text style={styles.thumbnailEmoji}>🎬</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title ?? '변환된 레시피'}
            </Text>
            {item.channelName ? (
              <Text style={styles.cardChannel} numberOfLines={1}>
                {item.channelName}
              </Text>
            ) : null}
            <Text style={styles.cardTime}>{formatTimeAgo(item.convertedAt)}</Text>
          </View>

          {/* Arrow */}
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
      </Swipeable>
    ),
    [renderRightActions, router],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>쇼츠 변환</Text>
        <Text style={styles.subtitle}>유튜브 쇼츠를 레시피로 변환해보세요</Text>
      </View>

      {/* URL Input */}
      <View style={styles.inputSection}>
        <View style={[styles.inputRow, hasInput && (isValid ? styles.inputRowValid : styles.inputRowInvalid)]}>
          <Text style={styles.inputIcon}>📺</Text>
          <TextInput
            style={styles.input}
            placeholder="유튜브 쇼츠 URL 붙여넣기"
            placeholderTextColor={colors.textTertiary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {hasInput && (
            <Text style={styles.validationIcon}>{isValid ? '✅' : '❌'}</Text>
          )}
          <TouchableOpacity style={styles.pasteBtn} onPress={handlePaste}>
            <Text style={styles.pasteText}>붙여넣기</Text>
          </TouchableOpacity>
        </View>
        {showUrlError && (
          <Text style={styles.urlError}>유튜브 쇼츠 URL 형식이 아니에요</Text>
        )}
        <Button
          title="레시피로 변환"
          onPress={handleConvert}
          loading={convertMutation.isPending}
          disabled={!hasInput || showUrlError}
          size="large"
          style={styles.convertBtn}
        />
      </View>

      {/* Recent Conversions */}
      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 변환</Text>
          {uniqueHistory.length > 0 && (
            <TouchableOpacity onPress={handleDeleteAll}>
              <Text style={styles.deleteAllBtn}>전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        {uniqueHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              emoji="🎬"
              title="아직 변환한 영상이 없어요"
              description="유튜브 쇼츠 URL을 붙여넣어 보세요"
            />
          </View>
        ) : (
          <FlatList
            data={uniqueHistory}
            keyExtractor={(item) => String(item.cacheId)}
            renderItem={renderHistoryCard}
            contentContainerStyle={styles.cardList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // URL Input
  inputSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingLeft: spacing.sm,
    gap: spacing.xs,
  },
  inputRowValid: {
    borderColor: colors.success,
  },
  inputRowInvalid: {
    borderColor: colors.error,
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    ...typography.caption,
    color: colors.textPrimary,
    paddingVertical: 12,
    padding: 0,
  },
  validationIcon: {
    fontSize: 14,
  },
  pasteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.divider,
  },
  pasteText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  urlError: {
    ...typography.small,
    color: colors.error,
    marginTop: -2,
    marginLeft: spacing.xs,
  },
  convertBtn: {
    width: '100%',
  },
  // History section
  historySection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  deleteAllBtn: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  // Card list
  cardList: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadow.sm,
  },
  // Thumbnail
  thumbnailBox: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.divider,
  },
  thumbnail: {
    width: 80,
    height: 60,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  // Card info
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardChannel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  cardTime: {
    ...typography.small,
    color: colors.textTertiary,
  },
  // Arrow
  cardArrow: {
    fontSize: 22,
    color: colors.textTertiary,
    fontWeight: '300',
    paddingRight: spacing.xs,
  },
  // Swipe delete
  swipeDeleteBtn: {
    width: 72,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  swipeDeleteText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
});
