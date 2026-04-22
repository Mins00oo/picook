import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, fontFamily, shadow, getIngredientEmoji } from '../../../src/constants/theme';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { recipeApi } from '../../../src/api/recipeApi';
import { useFavorites } from '../../../src/hooks/useFavorites';
import { formatCookTime, formatDifficulty, toAbsoluteImageUrl } from '../../../src/utils/format';
import type { RecipeStep, RecipeIngredient } from '../../../src/types/recipe';

export default function RecipeDetailScreen() {
  const { id, missingIds } = useLocalSearchParams<{ id: string; missingIds?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recipeId = Number(id);

  const missingSet = useMemo(
    () => new Set(missingIds ? missingIds.split(',').map(Number) : []),
    [missingIds],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => (await recipeApi.getDetail(recipeId)).data.data,
    enabled: !!recipeId,
  });

  const { data: favorites, add, remove } = useFavorites();
  const favorite = favorites?.find((f) => f.recipeId === recipeId);
  const isFav = !!favorite;

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorScreen onRetry={() => refetch()} />;

  const recipe = data;
  const required = recipe.ingredients.filter((i) => i.isRequired);
  const optional = recipe.ingredients.filter((i) => !i.isRequired);
  const heroImg = toAbsoluteImageUrl(recipe.imageUrl ?? recipe.thumbnailUrl);

  const handleFavToggle = () => {
    if (isFav && favorite) remove.mutate(favorite.id);
    else add.mutate(recipeId);
  };

  return (
    <View style={styles.container}>
      {/* Hero image */}
      <View style={styles.heroWrap}>
        {heroImg ? (
          <Image source={{ uri: heroImg }} style={styles.hero} contentFit="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
          </View>
        )}
        {/* Top buttons (floating) */}
        <View style={[styles.heroTop, { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0) }]}>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtn} onPress={handleFavToggle} activeOpacity={0.85}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                fill={isFav ? colors.primary : 'none'}
                stroke={isFav ? colors.primary : colors.textPrimary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Body card */}
        <View style={styles.body}>
          {/* Category pills */}
          <View style={styles.pillsRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.pillText}>{recipe.category}</Text>
            </View>
            {recipe.coachingReady && (
              <View style={[styles.categoryPill, styles.pillAccent]}>
                <Text style={[styles.pillText, { color: colors.primary }]}>초보 추천</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <MetaItem emoji="⏱️" value={formatCookTime(recipe.cookingTimeMinutes)} />
            <Dot />
            <MetaItem emoji="🔥" value={formatDifficulty(recipe.difficulty)} />
            <Dot />
            <MetaItem emoji="👥" value={`${recipe.servings}인분`} />
          </View>

          {recipe.tips && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsLabel}>TIP</Text>
              <Text style={styles.tipsText}>{recipe.tips}</Text>
            </View>
          )}
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionIco}>🧺</Text>
            <Text style={styles.sectionTitle}>재료</Text>
            <Text style={styles.sectionSub}>{recipe.ingredients.length}가지</Text>
          </View>

          <View style={styles.ingredientsCard}>
            {required.length > 0 && (
              <>
                <View style={styles.subHeadRow}>
                  <View style={[styles.dotMarker, { backgroundColor: colors.primary }]} />
                  <Text style={styles.subHead}>필수</Text>
                  <Text style={styles.subHeadCount}>{required.length}</Text>
                </View>
                <View style={styles.chipWrap}>
                  {required.map((ing) => (
                    <IngredientChip key={ing.ingredientId} ing={ing} required missing={missingSet.has(ing.ingredientId)} />
                  ))}
                </View>
              </>
            )}

            {optional.length > 0 && (
              <>
                {required.length > 0 && <View style={styles.divider} />}
                <View style={styles.subHeadRow}>
                  <View style={[styles.dotMarker, { backgroundColor: colors.textTertiary }]} />
                  <Text style={styles.subHead}>선택</Text>
                  <Text style={styles.subHeadCount}>{optional.length}</Text>
                </View>
                <View style={styles.chipWrap}>
                  {optional.map((ing) => (
                    <IngredientChip key={ing.ingredientId} ing={ing} required={false} missing={missingSet.has(ing.ingredientId)} />
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionIco}>📖</Text>
            <Text style={styles.sectionTitle}>조리 단계</Text>
            <Text style={styles.sectionSub}>{recipe.steps.length}단계</Text>
          </View>

          <View style={styles.steps}>
            {recipe.steps.map((step, idx) => (
              <StepCard key={step.stepNumber} step={step} last={idx === recipe.steps.length - 1} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push({ pathname: '/cooking/complete', params: { recipeId: String(recipe.id) } })}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>요리 완료</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path d="M5 12h14M13 5l7 7-7 7" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetaItem({ emoji, value }: { emoji: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={{ fontSize: 12 }}>{emoji}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function Dot() {
  return <Text style={styles.metaDotChar}>·</Text>;
}

function IngredientChip({
  ing, required, missing,
}: { ing: RecipeIngredient; required: boolean; missing: boolean }) {
  return (
    <View style={[
      styles.ingChip,
      required ? styles.ingChipReq : styles.ingChipOpt,
      missing && styles.ingChipMissing,
    ]}>
      <Text style={{ fontSize: 13 }}>{getIngredientEmoji(ing.ingredientName)}</Text>
      <Text style={[
        styles.ingChipText,
        required ? styles.ingChipTextReq : styles.ingChipTextOpt,
        missing && { color: colors.textTertiary },
      ]}>
        {ing.ingredientName}
      </Text>
      {ing.amount > 0 && (
        <Text style={[styles.ingChipAmount, missing && { color: colors.textTertiary }]}>
          {ing.amount}{ing.unit ?? ''}
        </Text>
      )}
      {missing && (
        <View style={styles.missTag}>
          <Text style={styles.missTagText}>없음</Text>
        </View>
      )}
    </View>
  );
}

function StepCard({ step, last }: { step: RecipeStep; last: boolean }) {
  const isWait = step.stepType === 'WAIT';
  const stepImg = toAbsoluteImageUrl(step.imageUrl);
  const durationMin = step.durationSeconds ? Math.ceil(step.durationSeconds / 60) : 0;

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNumCol}>
        <View style={styles.stepNumCircle}>
          <Text style={styles.stepNumText}>{step.stepNumber}</Text>
        </View>
        {!last && <View style={styles.stepConnector} />}
      </View>

      <View style={styles.stepCard}>
        {stepImg && (
          <View style={styles.stepThumbWrap}>
            <Image source={{ uri: stepImg }} style={styles.stepThumb} contentFit="cover" />
          </View>
        )}
        <View style={styles.stepBody}>
          <Text style={styles.stepDesc}>{step.description}</Text>
          {durationMin > 0 && (
            <View style={[styles.timeTag, isWait && styles.timeTagWait]}>
              <Text style={{ fontSize: 10 }}>{isWait ? '⏱️' : '🔥'}</Text>
              <Text style={[styles.timeTagText, isWait && { color: colors.warning }]}>
                {durationMin}분 {isWait ? '대기' : '조리'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  heroWrap: { position: 'relative' },
  hero: {
    width: '100%',
    aspectRatio: 1.15,
    backgroundColor: colors.lineSoft,
  },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heroTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  heroBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },

  scroll: { flex: 1, marginTop: -28 },
  scrollContent: {},

  body: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 10,
  },
  pillsRow: { flexDirection: 'row', gap: 6 },
  categoryPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pillAccent: { backgroundColor: colors.accentSoft, borderColor: colors.accent2 },
  pillText: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaValue: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDotChar: { color: colors.textTertiary, fontSize: 12 },

  tipsBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    marginTop: 6,
  },
  tipsLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  tipsText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },

  section: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionIco: { fontSize: 14 },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textTertiary,
  },

  ingredientsCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 10,
  },
  subHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotMarker: { width: 6, height: 6, borderRadius: 3 },
  subHead: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  subHeadCount: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textTertiary,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
  ingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 100,
    borderWidth: 1,
  },
  ingChipReq: {
    backgroundColor: colors.inkDark,
    borderColor: colors.inkDark,
  },
  ingChipOpt: {
    backgroundColor: colors.lineSoft,
    borderColor: colors.line,
  },
  ingChipMissing: {
    opacity: 0.55,
  },
  ingChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
  },
  ingChipTextReq: { color: '#fff' },
  ingChipTextOpt: { color: colors.textPrimary },
  ingChipAmount: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 2,
  },
  missTag: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 4,
  },
  missTagText: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    color: colors.error,
  },

  // Steps
  steps: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: 10 },
  stepNumCol: { alignItems: 'center' },
  stepNumCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: colors.primary,
  },
  stepConnector: {
    flex: 1,
    width: 2,
    backgroundColor: colors.line,
    marginVertical: 2,
  },
  stepCard: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  stepThumbWrap: { borderRadius: 10, overflow: 'hidden' },
  stepThumb: { width: 72, height: 72 },
  stepBody: { flex: 1, gap: 6 },
  stepDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  timeTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: colors.accentSoft,
  },
  timeTagWait: { backgroundColor: '#FEF3C7' },
  timeTagText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: -0.1,
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  cta: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...shadow.cta,
  },
  ctaText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#fff',
    letterSpacing: -0.3,
  },
});
