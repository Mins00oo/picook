import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  AppState,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, typography, spacing, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/common/Button';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { ConvertingProgress } from '../../../src/components/shorts/ConvertingProgress';
import { shortsApi } from '../../../src/api/shortsApi';
import { coachingApi } from '../../../src/api/coachingApi';
import { useCoachingStore } from '../../../src/stores/coachingStore';
import { useShortsConvertStore } from '../../../src/stores/shortsConvertStore';
import type { ShortsConvertResponse, ShortsStep } from '../../../src/types/shorts';

export default function ShortsResultScreen() {
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const router = useRouter();

  const navigation = useNavigation();
  const isConvertMode = mode === 'converting';

  const [isStartingCoaching, setIsStartingCoaching] = useState(false);
  const setShortsCookingData = useCoachingStore((s) => s.setShortsCookingData);
  const queryClient = useQueryClient();

  // ─── 쇼츠 즐겨찾기 ───
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);

  const addFavMutation = useMutation({
    mutationFn: (cacheId: number) => shortsApi.addFavorite(cacheId),
    onSuccess: (res) => {
      setIsFavorited(true);
      setFavoriteId(res.data.data.id);
      queryClient.invalidateQueries({ queryKey: ['shorts-favorites'] });
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === 'SHORTS_FAVORITE_DUPLICATE') {
        setIsFavorited(true);
      } else if (code === 'SHORTS_FAVORITE_LIMIT') {
        Alert.alert('알림', '즐겨찾기는 최대 20개까지 저장할 수 있어요.');
      } else {
        Alert.alert('오류', '즐겨찾기 저장에 실패했어요.');
      }
    },
  });

  const removeFavMutation = useMutation({
    mutationFn: (favId: number) => shortsApi.removeFavorite(favId),
    onSuccess: () => {
      setIsFavorited(false);
      setFavoriteId(null);
      queryClient.invalidateQueries({ queryKey: ['shorts-favorites'] });
    },
  });

  // 결과 데이터가 로드되면 즐겨찾기 여부 확인
  const checkFavoriteStatus = async (cacheId: number) => {
    try {
      const res = await shortsApi.getFavorites();
      const match = res.data.data.find((f) => f.shortsCacheId === cacheId);
      if (match) {
        setIsFavorited(true);
        setFavoriteId(match.id);
      }
    } catch {
      // 무시
    }
  };

  // ─── 변환 모드: 스토어에서 상태 읽기 ───
  const convertStatus = useShortsConvertStore((s) => s.status);
  const convertResult = useShortsConvertStore((s) => s.result);
  const convertError = useShortsConvertStore((s) => s.errorMessage);
  const startedAt = useShortsConvertStore((s) => s.startedAt);
  const retry = useShortsConvertStore((s) => s.retry);
  const reset = useShortsConvertStore((s) => s.reset);

  const appStateRef = useRef(AppState.currentState);

  // ─── 히스토리 모드: 서버에서 조회 ───
  const { data: historyData, isLoading, error, refetch } = useQuery({
    queryKey: ['shorts', id],
    queryFn: async () => {
      const res = await shortsApi.getDetail(Number(id));
      return res.data.data;
    },
    enabled: !isConvertMode && !!id,
  });

  // 즐겨찾기 상태 확인 (변환 완료 시 / 히스토리 모드)
  useEffect(() => {
    if (convertStatus === 'done' && convertResult?.cacheId) {
      checkFavoriteStatus(convertResult.cacheId);
    }
  }, [convertStatus, convertResult?.cacheId]);

  useEffect(() => {
    if (!isConvertMode && historyData?.cacheId) {
      checkFavoriteStatus(historyData.cacheId);
    }
  }, [isConvertMode, historyData?.cacheId]);

  // 변환 완료 시 스토어 초기화는 화면 떠날 때
  useEffect(() => {
    return () => {
      if (isConvertMode) reset();
    };
  }, [isConvertMode, reset]);

  // 백그라운드 → 포그라운드 복귀 시 자동 복구
  useEffect(() => {
    if (!isConvertMode) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // background/inactive → active 전환 시
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // 스토어에서 최신 상태를 직접 읽음 (클로저 의존 X)
        const state = useShortsConvertStore.getState();
        if (state.needsRecovery) {
          state.recoverFromBackground();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isConvertMode]); // convertStatus 의존 제거 — getState()로 직접 읽음

  // 변환 중 iOS 스와이프 뒤로가기 차단
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: convertStatus !== 'converting' });
  }, [convertStatus, navigation]);

  // 변환 중 Android 뒤로가기 차단
  useEffect(() => {
    if (convertStatus !== 'converting') return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('변환 취소', '변환을 취소하시겠어요?', [
        { text: '계속 진행', style: 'cancel' },
        { text: '취소', style: 'destructive', onPress: () => { reset(); router.back(); } },
      ]);
      return true;
    });
    return () => handler.remove();
  }, [convertStatus, reset, router]);

  // ─── 변환 모드: 진행/완료/에러 분기 ───
  if (isConvertMode) {
    // 변환 중
    if (convertStatus === 'converting' && startedAt) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <ConvertingProgress
            startedAt={startedAt}
            isDone={false}
          />
        </SafeAreaView>
      );
    }

    // 에러
    if (convertStatus === 'error') {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>😥</Text>
            <Text style={styles.errorMessage}>{convertError}</Text>
            <View style={styles.errorButtons}>
              <Button
                title="다시 시도"
                onPress={retry}
                size="medium"
                style={styles.errorBtn}
              />
              <Button
                title="뒤로 가기"
                onPress={() => { reset(); router.back(); }}
                variant="outline"
                size="medium"
                style={styles.errorBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    // 완료 → 결과 표시 (아래 공통 렌더로 fallthrough)
    if (convertStatus === 'done' && convertResult) {
      return renderResult(convertResult);
    }

    // idle (취소 후 돌아왔거나 비정상 상태)
    return (
      <SafeAreaView style={styles.container}>
        <ErrorScreen
          message="변환 결과를 불러오지 못했어요"
          onRetry={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  // ─── 히스토리 모드 ───
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading message="변환 결과를 불러오는 중..." />
      </SafeAreaView>
    );
  }

  if (error || !historyData) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorScreen
          message="변환 결과를 불러오지 못했어요"
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return renderResult(historyData);

  // ─── ShortsStep → RecipeStep 형태 매핑 ───
  function mapShortsStepsToCoachingSteps(steps: ShortsStep[]) {
    return steps.map((s) => ({
      id: s.stepNumber,
      stepNumber: s.stepNumber,
      description: s.instruction,
      stepType: s.type,
      durationSeconds: s.durationSeconds ?? 60,
      imageUrl: null,
      canParallel: false,
    }));
  }

  // ─── 코칭 시작 핸들러 ───
  async function handleStartCoaching(data: ShortsConvertResponse) {
    if (!data.recipe?.steps?.length) {
      Alert.alert('알림', '조리 단계가 없어 코칭을 시작할 수 없어요.');
      return;
    }
    setIsStartingCoaching(true);
    try {
      const res = await coachingApi.start({
        mode: 'single',
        shortsCacheId: data.cacheId,
      });
      const coachingLogId = res.data.data.id;
      const mappedSteps = mapShortsStepsToCoachingSteps(data.recipe.steps);

      // 스토어 경유 (navigation params 크기 제한 우회)
      setShortsCookingData({
        coachingId: coachingLogId,
        title: data.recipe.title,
        steps: mappedSteps as any,
      });

      router.push({
        pathname: '/cooking/single/[id]',
        params: { id: 'shorts' },
      });
    } catch {
      Alert.alert('오류', '코칭을 시작할 수 없어요. 다시 시도해주세요.');
    } finally {
      setIsStartingCoaching(false);
    }
  }

  // ─── 결과 렌더 (공통) ───
  function renderResult(data: ShortsConvertResponse) {
    const recipe = data.recipe;
    if (!recipe) return <ErrorScreen message="레시피 데이터가 없습니다" />;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>변환 결과</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.desc}>{recipe.description}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>재료</Text>
            {recipe.ingredients.map((ing, i) => (
              <Text key={i} style={styles.ingredientText}>• {ing}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>조리 순서</Text>
            {recipe.steps.map((step) => (
              <View key={step.stepNumber} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepEmoji}>
                    {step.type === 'WAIT' ? '⏱️' : '🔥'}
                  </Text>
                  <Text style={styles.stepNum}>Step {step.stepNumber}</Text>
                  {step.durationSeconds && (
                    <Text style={styles.stepTime}>
                      {Math.ceil(step.durationSeconds / 60)}분
                    </Text>
                  )}
                </View>
                <Text style={styles.stepDesc}>{step.instruction}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 저장'}
            onPress={() => {
              if (isFavorited && favoriteId) {
                removeFavMutation.mutate(favoriteId);
              } else {
                addFavMutation.mutate(data.cacheId);
              }
            }}
            variant={isFavorited ? 'primary' : 'outline'}
            loading={addFavMutation.isPending || removeFavMutation.isPending}
            size="medium"
            style={styles.halfBtn}
          />
          <Button
            title="코칭 시작"
            onPress={() => handleStartCoaching(data)}
            loading={isStartingCoaching}
            size="medium"
            style={styles.halfBtn}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  back: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  desc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  ingredientText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepEmoji: {
    fontSize: 16,
  },
  stepNum: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  stepTime: {
    ...typography.small,
    color: colors.textSecondary,
  },
  stepDesc: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  halfBtn: {
    flex: 1,
  },
  // 에러 상태
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  errorEmoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  errorBtn: {
    minWidth: 120,
  },
});
