import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { recipeApi } from '../../../src/api/recipeApi';
import { favoriteApi, FavoriteItem } from '../../../src/api/favoriteApi';
import { formatCookTime, formatDifficulty } from '../../../src/utils/format';
import type { RecipeStep } from '../../../src/types/recipe';

function StepIcon({ type }: { type: string }) {
  return (
    <View style={[styles.stepIcon, type === 'WAIT' ? styles.stepIconWait : styles.stepIconActive]}>
      <Text style={styles.stepIconText}>{type === 'WAIT' ? '⏱️' : '🔥'}</Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  const { id, missingIds } = useLocalSearchParams<{ id: string; missingIds?: string }>();
  const router = useRouter();
  const missingIdSet = new Set(
    missingIds ? missingIds.split(',').map(Number) : [],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await recipeApi.getDetail(Number(id));
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await favoriteApi.getList();
      return res.data.data;
    },
  });

  const isFavorited = favorites?.some((fav: FavoriteItem) => fav.recipeId === Number(id)) ?? false;

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorScreen onRetry={() => refetch()} />;

  const recipe = data;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.heart}>{isFavorited ? '❤️' : '🤍'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>🍽️</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.tips && (
            <Text style={styles.description}>{recipe.tips}</Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>조리시간</Text>
              <Text style={styles.metaValue}>{formatCookTime(recipe.cookingTimeMinutes)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>난이도</Text>
              <Text style={styles.metaValue}>{formatDifficulty(recipe.difficulty)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>인분</Text>
              <Text style={styles.metaValue}>{recipe.servings}인분</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료</Text>
          {recipe.ingredients.map((ing) => {
            const isMissing = missingIdSet.has(ing.ingredientId);
            return (
              <View key={ing.ingredientId} style={styles.ingredientRow}>
                <View style={styles.ingredientNameRow}>
                  <Text style={[styles.ingredientName, isMissing && styles.ingredientMissing]}>
                    {ing.ingredientName}
                    {!ing.isRequired && ' (선택)'}
                  </Text>
                  {isMissing && (
                    <View style={styles.missingBadge}>
                      <Text style={styles.missingBadgeText}>미보유</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.ingredientAmount}>
                  {ing.amount}{ing.unit ? ` ${ing.unit}` : ''}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>조리 순서</Text>
          {recipe.steps.map((step: RecipeStep) => (
            <View key={step.stepNumber} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <StepIcon type={step.stepType} />
                <Text style={styles.stepNumber}>
                  Step {step.stepNumber}
                </Text>
                {step.durationSeconds && (
                  <Text style={styles.stepDuration}>
                    {Math.ceil(step.durationSeconds / 60)}분
                  </Text>
                )}
              </View>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="코칭 시작"
          onPress={() => router.push(`/cooking/single/${id}`)}
          size="large"
          style={styles.coachButton}
        />
      </View>
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
  heart: {
    fontSize: 24,
  },
  scroll: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  info: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  ingredientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    color: Colors.text,
  },
  ingredientMissing: {
    color: '#9CA3AF',
  },
  missingBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  missingBadgeText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  ingredientAmount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stepCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconActive: {
    backgroundColor: '#FFF0E8',
  },
  stepIconWait: {
    backgroundColor: '#E8F8F6',
  },
  stepIconText: {
    fontSize: 14,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  stepDuration: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  stepDesc: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 32,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  coachButton: {
    width: '100%',
  },
});
