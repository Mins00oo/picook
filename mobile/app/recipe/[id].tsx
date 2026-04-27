import React, { useMemo, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, getIngredientEmoji } from '../../src/constants/theme';
import { Loading } from '../../src/components/common/Loading';
import { ErrorScreen } from '../../src/components/common/ErrorScreen';
import { ImageLightbox } from '../../src/components/common/ImageLightbox';
import { CheckmarkIcon } from '../../src/components/brand/CheckmarkIcon';
import { recipeApi } from '../../src/api/recipeApi';
import { useFavorites } from '../../src/hooks/useFavorites';
import { formatCookTime, formatDifficulty, formatCategory, toAbsoluteImageUrl } from '../../src/utils/format';
import type { RecipeStep, RecipeIngredient } from '../../src/types/recipe';

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

  const [lightbox, setLightbox] = useState<string | null>(null);

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image — scrolls with content */}
        <View style={styles.heroWrap}>
          {heroImg ? (
            <Image source={{ uri: heroImg }} style={styles.hero} contentFit="cover" />
          ) : (
            <View style={[styles.hero, styles.heroPlaceholder]}>
              <Text style={{ fontSize: 48 }}>🍽️</Text>
            </View>
          )}
        </View>

        {/* Body card */}
        <View style={styles.body}>
          <View style={styles.pillsRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.pillText}>{formatCategory(recipe.category)}</Text>
            </View>
          </View>

          <Text style={styles.title}>{recipe.title}</Text>

          {/* Meta row — 시간 · 난이도 · 인분 · 칼로리 */}
          <View style={styles.metaRow}>
            <MetaItem emoji="⏱️" value={formatCookTime(recipe.cookingTimeMinutes)} />
            <Dot />
            <MetaItem emoji="🔥" value={formatDifficulty(recipe.difficulty)} />
            <Dot />
            <MetaItem emoji="👥" value={`${recipe.servings}인분`} />
            {recipe.calories != null && (
              <>
                <Dot />
                <MetaItem emoji="🔋" value={`${recipe.calories}kcal`} />
              </>
            )}
          </View>

          {recipe.tips && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsLabel}>TIP</Text>
              <Text style={styles.tipsText}>{recipe.tips}</Text>
            </View>
          )}
        </View>

        {/* 준비물 */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionIco}>🧺</Text>
            <Text style={styles.sectionTitle}>준비물</Text>
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

        {/* 만드는 법 */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionIco}>📖</Text>
            <Text style={styles.sectionTitle}>만드는 법</Text>
            <Text style={styles.sectionSub}>{recipe.steps.length}단계 · 사진 탭해서 크게 보기</Text>
          </View>

          <View style={styles.steps}>
            {recipe.steps.map((step, idx) => (
              <StepCard
                key={step.stepNumber}
                step={step}
                last={idx === recipe.steps.length - 1}
                onThumbPress={(uri) => setLightbox(uri)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Top action buttons — fixed over content */}
      <View
        style={[styles.heroTop, { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0) }]}
        pointerEvents="box-none"
      >
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

      {/* Bottom CTA — gradient fade */}
      <LinearGradient
        colors={['rgba(255,248,241,0)', 'rgba(255,248,241,0.95)', colors.background]}
        locations={[0, 0.3, 0.6]}
        pointerEvents="box-none"
        style={[styles.bottom, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}
      >
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push({ pathname: '/cooking/complete', params: { recipeId: String(recipe.id) } })}
          activeOpacity={0.85}
        >
          <CheckmarkIcon size={16} color="#fff" />
          <Text style={styles.ctaText}>요리 완료</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ImageLightbox
        visible={lightbox !== null}
        uri={lightbox}
        onClose={() => setLightbox(null)}
      />
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
        <Text style={[
          required ? styles.ingChipAmountReq : styles.ingChipAmountOpt,
          missing && { color: colors.textTertiary },
        ]}>
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

/**
 * description 첫 줄(또는 첫 "." 전)을 step title로 추출.
 * 백엔드에 별도 title 필드 없어서 클라에서 파싱 (변경 유예).
 */
function splitStepText(description: string): { title: string | null; body: string } {
  if (!description) return { title: null, body: '' };
  const trimmed = description.trim();
  // 1) 줄바꿈 기준
  const nlIdx = trimmed.indexOf('\n');
  if (nlIdx > 0 && nlIdx <= 20) {
    const head = trimmed.slice(0, nlIdx).trim();
    const rest = trimmed.slice(nlIdx + 1).trim();
    if (head && rest) return { title: head, body: rest };
  }
  // 2) 마침표+공백 기준 (첫 문장 길이가 ≤18자여야 타이틀 취급)
  const dotMatch = trimmed.match(/^([^.!?\n]{2,18})[.!?]\s+(.+)$/s);
  if (dotMatch) return { title: dotMatch[1], body: dotMatch[2] };
  // 3) 실패 → 본문만
  return { title: null, body: trimmed };
}

function StepCard({
  step, last, onThumbPress,
}: {
  step: RecipeStep;
  last: boolean;
  onThumbPress: (uri: string) => void;
}) {
  const stepImg = toAbsoluteImageUrl(step.imageUrl);
  const { title, body } = splitStepText(step.description);

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
          <TouchableOpacity
            style={styles.stepThumbWrap}
            onPress={() => onThumbPress(stepImg)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: stepImg }} style={styles.stepThumb} contentFit="cover" />
            <View style={styles.zoomHint}>
              <Svg width={10} height={10} viewBox="0 0 24 24">
                <Path
                  d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7"
                  stroke="#fff"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.stepBody}>
          {title && <Text style={styles.stepTitle}>{title}</Text>}
          <Text style={styles.stepDesc}>{body}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  heroWrap: { width: '100%' },
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
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

  scroll: { flex: 1 },
  scrollContent: {},

  body: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginTop: -28,
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
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
  ingChipAmountReq: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginLeft: 2,
  },
  ingChipAmountOpt: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textTertiary,
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
  stepThumbWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    width: 80,
    height: 80,
  },
  stepThumb: { width: 80, height: 80 },
  zoomHint: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(31,22,18,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBody: { flex: 1, gap: 5 },
  stepTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  stepDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  cta: {
    height: 52,
    borderRadius: 16,
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
