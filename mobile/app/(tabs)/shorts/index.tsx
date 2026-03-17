import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
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
import { useShortsConvertStore } from '../../../src/stores/shortsConvertStore';
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const isSelectMode = selectedIds.size > 0;

  // ─── Queries ───
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['shorts-history'],
    queryFn: async () => {
      const res = await shortsApi.getRecent();
      return res.data.data;
    },
  });

  // ─── Shorts convert (Zustand store) ───
  const startConvert = useShortsConvertStore((s) => s.startConvert);
  const convertStatus = useShortsConvertStore((s) => s.status);

  const deleteMutation = useMutation({
    mutationFn: (historyId: number) => shortsApi.deleteHistory(historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts-history'] });
    },
    onError: () => {
      Alert.alert('오류', '삭제에 실패했어요');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => shortsApi.deleteAllHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts-history'] });
      setSelectedIds(new Set());
    },
  });

  // ─── Derived state ───
  const hasInput = url.trim().length > 0;
  const isValid = isValidShortsUrl(url);
  const showUrlError = hasInput && !isValid;

  const uniqueHistory = useMemo(() => {
    const list = historyData ?? [];
    return list.filter(
      (item: ShortsHistory, idx: number, arr: ShortsHistory[]) =>
        arr.findIndex((x: ShortsHistory) => x.youtubeUrl === item.youtubeUrl) === idx,
    );
  }, [historyData]);

  const isAllSelected = uniqueHistory.length > 0 && selectedIds.size === uniqueHistory.length;

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
    startConvert(url);
    router.push({ pathname: '/(tabs)/shorts/result', params: { mode: 'converting' } });
  };

  const toggleSelect = useCallback((cacheId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cacheId)) next.delete(cacheId);
      else next.add(cacheId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(uniqueHistory.map((item) => item.cacheId)));
    }
  }, [isAllSelected, uniqueHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    const isAll = count === uniqueHistory.length;
    const message = isAll
      ? '모든 기록을 삭제할까요?'
      : `선택한 ${count}개를 삭제할까요?`;

    Alert.alert('삭제', message, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          if (isAll) {
            deleteAllMutation.mutate();
          } else {
            const ids = Array.from(selectedIds);
            for (const id of ids) {
              await shortsApi.deleteHistory(id);
            }
            queryClient.invalidateQueries({ queryKey: ['shorts-history'] });
            setSelectedIds(new Set());
          }
        },
      },
    ]);
  }, [selectedIds, uniqueHistory.length, deleteAllMutation, queryClient]);

  const handleCardPress = useCallback(
    (item: ShortsHistory) => {
      if (isSelectMode) {
        toggleSelect(item.cacheId);
      } else {
        router.push({
          pathname: '/(tabs)/shorts/result',
          params: { id: String(item.cacheId) },
        });
      }
    },
    [isSelectMode, toggleSelect, router],
  );

  // ─── Card render ───
  const renderHistoryCard = useCallback(
    ({ item }: { item: ShortsHistory }) => {
      const selected = selectedIds.has(item.cacheId);

      return (
        <TouchableOpacity
          style={[styles.card, selected && styles.cardSelected]}
          activeOpacity={0.7}
          onPress={() => handleCardPress(item)}
          onLongPress={() => {
            if (!isSelectMode) toggleSelect(item.cacheId);
          }}
        >
          {/* Checkbox */}
          <TouchableOpacity
            style={[styles.checkbox, selected && styles.checkboxSelected]}
            onPress={() => toggleSelect(item.cacheId)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {selected && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

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
              {item.title ?? '레시피'}
            </Text>
            {item.channelName ? (
              <Text style={styles.cardChannel} numberOfLines={1}>
                {item.channelName}
              </Text>
            ) : null}
            <Text style={styles.cardTime}>{formatTimeAgo(item.convertedAt)}</Text>
          </View>

          {/* Arrow (선택 모드가 아닐 때만) */}
          {!isSelectMode && <Text style={styles.cardArrow}>›</Text>}
        </TouchableOpacity>
      );
    },
    [selectedIds, isSelectMode, handleCardPress, toggleSelect],
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
          loading={convertStatus === 'converting'}
          disabled={!hasInput || showUrlError || convertStatus === 'converting'}
          size="large"
          style={styles.convertBtn}
        />
      </View>

      {/* History */}
      <View style={styles.historySection}>
        {/* Section toolbar */}
        <View style={[styles.sectionHeader, uniqueHistory.length > 0 && styles.sectionHeaderWithBorder]}>
          {uniqueHistory.length > 0 ? (
            <>
              <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll}>
                <View style={[styles.checkboxSmall, isAllSelected && styles.checkboxSmallSelected]}>
                  {isAllSelected && <Text style={styles.checkmarkSmall}>✓</Text>}
                </View>
                <Text style={styles.countText}>{uniqueHistory.length}개</Text>
              </TouchableOpacity>

              {isSelectMode ? (
                <TouchableOpacity onPress={handleDeleteSelected}>
                  <Text style={styles.deleteBtn}>삭제 ({selectedIds.size})</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.sectionLabel}>최근 변환</Text>
              )}
            </>
          ) : (
            <Text style={styles.sectionLabel}>최근 변환</Text>
          )}
        </View>

        {isHistoryLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.textTertiary} />
          </View>
        ) : uniqueHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              emoji="🎬"
              title="아직 변환한 영상이 없어요"
              description="유튜브 쇼츠 URL을 붙여넣어 보세요"
              transparent
            />
          </View>
        ) : (
          <FlatList
            data={uniqueHistory}
            keyExtractor={(item) => String(item.cacheId)}
            renderItem={renderHistoryCard}
            contentContainerStyle={styles.cardList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionHeaderWithBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  deleteBtn: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  // Checkbox (small — toolbar)
  checkboxSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSmallSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmarkSmall: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: -1,
  },
  // Loading / Empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  // Card list
  cardList: {
    paddingBottom: spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: 56,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    gap: 12,
    backgroundColor: colors.background,
  },
  cardSelected: {
    backgroundColor: colors.primaryLight,
  },
  // Checkbox (card)
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: -1,
  },
  // Thumbnail
  thumbnailBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.divider,
  },
  thumbnail: {
    width: 56,
    height: 56,
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  thumbnailEmoji: {
    fontSize: 22,
  },
  // Card info
  cardInfo: {
    flex: 1,
    gap: 1,
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
    fontSize: 18,
    color: colors.textTertiary,
    fontWeight: '300',
  },
});
