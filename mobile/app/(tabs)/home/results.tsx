import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Colors } from '../../../src/constants/colors';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { Button } from '../../../src/components/common/Button';
import { recipeApi } from '../../../src/api/recipeApi';
import { useSelectionStore } from '../../../src/stores/selectionStore';
import { useFilterStore } from '../../../src/stores/filterStore';
import { formatCookTime, formatDifficulty, formatMatchRate } from '../../../src/utils/format';
import type { RecipeSummary } from '../../../src/types/recipe';

const MAX_MULTI = 2;

export default function ResultsScreen() {
  const router = useRouter();
  const { getIds } = useSelectionStore();
  const { maxCookTimeMinutes, difficulty, servings } = useFilterStore();
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [multiSelected, setMultiSelected] = useState<number[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommend', getIds(), maxCookTimeMinutes, difficulty, servings],
    queryFn: async () => {
      const res = await recipeApi.recommend({
        ingredientIds: getIds(),
        maxTime: maxCookTimeMinutes ?? undefined,
        difficulty: difficulty ?? undefined,
        servings: servings ?? undefined,
      });
      return res.data.data;
    },
  });

  const toggleMultiSelect = useCallback((id: number) => {
    setMultiSelected((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= MAX_MULTI) {
        Alert.alert('알림', `최대 ${MAX_MULTI}개까지 선택 가능해요`);
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const handleToggleMode = () => {
    setIsMultiMode((prev) => !prev);
    setMultiSelected([]);
  };

  if (isLoading) return <Loading message="레시피를 찾는 중..." />;
  if (error) return <ErrorScreen message="추천 결과를 불러오지 못했습니다" onRetry={() => refetch()} />;

  const recipes = data ?? [];

  const getMatchStyle = (rate: number) => {
    if (rate >= 100) return { bg: '#DCFCE7', text: '#16A34A' };
    if (rate >= 70) return { bg: '#DCFCE7', text: '#16A34A' };
    if (rate >= 50) return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#F3F4F6', text: '#6B7280' };
  };

  const formatMissing = (items: RecipeSummary['missingIngredients']) => {
    if (!items || items.length === 0) return null;
    if (items.length <= 3) return items.map((i) => i.name).join(', ');
    return `${items[0].name}, ${items[1].name} 외 ${items.length - 2}개`;
  };

  const renderRecipe = ({ item }: { item: RecipeSummary }) => {
    const isChecked = multiSelected.includes(item.id);
    const matchStyle = getMatchStyle(item.matchingRate);
    const missingText = formatMissing(item.missingIngredients);
    return (
      <TouchableOpacity
        style={[styles.card, isMultiMode && isChecked && styles.cardChecked]}
        onPress={() => {
          if (isMultiMode) {
            toggleMultiSelect(item.id);
          } else {
            router.push({
              pathname: `/(tabs)/recipe/${item.id}`,
              params: item.missingIngredients?.length
                ? { missingIds: item.missingIngredients.map((i) => i.id).join(',') }
                : undefined,
            });
          }
        }}
        activeOpacity={0.7}
      >
        {isMultiMode && (
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}
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
            <Text style={styles.metaText}>{formatCookTime(item.cookingTimeMinutes)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{formatDifficulty(item.difficulty)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{item.servings}인분</Text>
          </View>
          {item.matchingRate != null && (
            <View style={[styles.matchBadge, { backgroundColor: matchStyle.bg }]}>
              <Text style={[styles.matchText, { color: matchStyle.text }]}>
                {item.matchingRate >= 100 ? '재료 완벽!' : `매칭률 ${formatMatchRate(item.matchingRate)}`}
              </Text>
            </View>
          )}
          {item.matchingRate >= 100 ? (
            <Text style={styles.ingredientComplete}>✅ 재료 모두 보유</Text>
          ) : missingText ? (
            <Text style={styles.missingText} numberOfLines={1}>
              🛒 부족: {missingText}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>추천 결과</Text>
        <TouchableOpacity onPress={handleToggleMode}>
          <Text style={[styles.modeToggle, isMultiMode && styles.modeToggleActive]}>
            {isMultiMode ? '일반' : '멀티 코칭'}
          </Text>
        </TouchableOpacity>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>😅</Text>
          <Text style={styles.emptyTitle}>선택한 재료와 일치하는 레시피가 없어요</Text>
          <Text style={styles.emptyDesc}>
            재료를 더 추가하거나 다른 조합을 시도해보세요
          </Text>
          <Text style={styles.emptyHint}>
            30% 이상 일치하는 레시피만 표시됩니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRecipe}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>{recipes.length}개의 레시피를 찾았어요</Text>
          }
          ListFooterComponent={
            <Text style={styles.footerHint}>
              선택한 재료와 30% 이상 일치하는 레시피만 표시돼요
            </Text>
          }
        />
      )}

      {isMultiMode && multiSelected.length === MAX_MULTI && (
        <View style={styles.multiFooter}>
          <Button
            title={`타임라인 미리보기 (${multiSelected.length}개)`}
            onPress={() =>
              router.push({
                pathname: '/cooking/multi-preview',
                params: { ids: multiSelected.join(',') },
              })
            }
            size="large"
            style={styles.multiButton}
          />
        </View>
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
  modeToggle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modeToggleActive: {
    color: Colors.primary,
    fontWeight: '600',
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
  cardChecked: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '600',
  },
  missingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ingredientComplete: {
    fontSize: 12,
    color: '#16A34A',
  },
  resultCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  footerHint: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
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
  emptyHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  multiFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  multiButton: {
    width: '100%',
  },
});
