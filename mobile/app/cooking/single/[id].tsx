import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  Vibration,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Colors } from '../../../src/constants/colors';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { CircularTimer } from '../../../src/components/coaching/CircularTimer';
import { recipeApi } from '../../../src/api/recipeApi';
import { coachingApi } from '../../../src/api/coachingApi';
import { CoachingEngine } from '../../../src/engines/CoachingEngine';
import { ttsService } from '../../../src/services/TTSService';
import { sttService } from '../../../src/services/STTService';
import { useAuthStore } from '../../../src/stores/authStore';
import { useCoachingStore } from '../../../src/stores/coachingStore';
import { formatTime } from '../../../src/utils/format';
import type { CoachingStatus } from '../../../src/types/coaching';

export default function SingleCookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const engineRef = useRef(new CoachingEngine());
  const shortsCookingData = useCoachingStore((s) => s.shortsCookingData);

  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<CoachingStatus>('IDLE');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const coachingIdRef = useRef<number | null>(null);

  const isShortsMode = id === 'shorts' && !!shortsCookingData;
  const recipeTitle = isShortsMode
    ? (shortsCookingData?.title ?? '쇼츠 레시피')
    : undefined; // DB 레시피는 아래 query에서

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await recipeApi.getDetail(Number(id));
      return res.data.data;
    },
    enabled: !isShortsMode && !!id,
  });

  const activeSteps = isShortsMode ? shortsCookingData!.steps : recipe?.steps;
  const displayTitle = recipeTitle ?? recipe?.title ?? '';

  // 예상 남은 시간 (현재 단계 이후의 durationSeconds 합)
  const estimatedRemaining = useMemo(() => {
    if (!activeSteps) return 0;
    let total = 0;
    for (let i = currentStep; i < activeSteps.length; i++) {
      total += (activeSteps[i] as any).durationSeconds ?? 0;
    }
    return total;
  }, [activeSteps, currentStep]);

  // ─── BackHandler (Android 뒤로가기 차단) ───
  const handleQuit = () => {
    Alert.alert('코칭 종료', '정말 코칭을 종료하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '종료',
        style: 'destructive',
        onPress: () => {
          engineRef.current.destroy();
          ttsService.stop();
          router.back();
        },
      },
    ]);
  };

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleQuit();
      return true;
    });
    return () => handler.remove();
  }, []);

  // ─── 코칭 엔진 초기화 ───
  useEffect(() => {
    if (!activeSteps || activeSteps.length === 0) return;

    if (isShortsMode && shortsCookingData?.coachingId) {
      coachingIdRef.current = shortsCookingData.coachingId;
    } else if (!isShortsMode) {
      coachingApi.start({
        mode: 'single',
        recipeIds: [Number(id)],
      }).then((res) => {
        coachingIdRef.current = res.data.data.id;
      }).catch(() => {});
    }

    const engine = engineRef.current;
    engine.init(activeSteps);

    const unsub = engine.on((event) => {
      switch (event.type) {
        case 'STEP_CHANGED':
          setCurrentStep(event.step);
          setRemaining(null);
          setTimerDone(false);
          if (user?.coachingEnabled !== false) {
            const s = activeSteps[event.step];
            if (s?.description) {
              ttsService.speak(`${event.step + 1}번째 단계. ${s.description}`).catch(() => {});
            }
          }
          break;
        case 'STATUS_CHANGED':
          setStatus(event.status);
          break;
        case 'TIMER_TICK':
          setRemaining(event.remaining);
          break;
        case 'TIMER_DONE':
          setTimerDone(true);
          Vibration.vibrate([0, 300, 100, 300]);
          if (user?.coachingEnabled !== false) {
            ttsService.speak('타이머가 완료되었습니다. 다음 단계로 넘어가세요.').catch(() => {});
          }
          break;
        case 'COMPLETED':
          router.replace({
            pathname: '/cooking/complete',
            params: {
              recipeId: isShortsMode ? 'shorts' : id,
              recipeTitle: displayTitle,
              elapsed: String(elapsed),
              coachingId: String(coachingIdRef.current ?? ''),
            },
          });
          break;
      }
    });

    engine.start();

    // ─── STT 음성 명령 ("다음", "반복") ───
    sttService.startListening((command) => {
      if (command === 'next') {
        ttsService.stop();
        if (engine.getStatus() === 'PAUSED') engine.resume();
        engine.next();
      } else if (command === 'repeat') {
        ttsService.stop();
        if (engine.getStatus() === 'PAUSED') engine.resume();
        engine.repeat();
      }
    });

    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      unsub();
      clearInterval(elapsedTimer);
      engine.destroy();
      ttsService.stop();
      sttService.stopListening();
    };
  }, [activeSteps, id, user?.coachingEnabled]);

  // ─── 로딩 / 에러 ───
  if (!isShortsMode && isLoading) return <Loading message="레시피를 불러오는 중..." />;
  if (!isShortsMode && (error || !recipe)) return <ErrorScreen />;
  if (!activeSteps) return <Loading message="준비 중..." />;

  const step = activeSteps[currentStep];
  const progress = ((currentStep + 1) / activeSteps.length) * 100;
  const stepType = (step as any)?.stepType ?? 'ACTIVE';
  const isWaitStep = stepType === 'WAIT';
  const isWaiting = isWaitStep && status === 'WAITING' && remaining != null && remaining > 0;
  const nextStep = activeSteps[currentStep + 1];
  const isLastStep = currentStep >= activeSteps.length - 1;
  const estimatedMin = Math.ceil(estimatedRemaining / 60);
  const stepImageUrl = (step as any)?.imageUrl as string | null | undefined;

  // 현재 단계 소요시간
  const stepDuration = (step as any)?.durationSeconds as number | null | undefined;
  const stepDurationLabel = formatStepDuration(stepDuration);

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header: X + 1/5 ─── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.quit}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>
          {currentStep + 1}/{activeSteps.length}
          {'  '}
          <Text style={styles.elapsedInline}>{formatTime(elapsed)}</Text>
        </Text>
      </View>

      {/* ─── Progress bar ─── */}
      <View style={styles.progressBg}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* ─── Body: flex:1, 사진 없으면 중앙 정렬 ─── */}
      <ScrollView
        contentContainerStyle={[
          styles.body,
          !stepImageUrl && styles.bodyCentered,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 요리명 */}
        {displayTitle ? (
          <Text style={styles.recipeTitle} numberOfLines={1}>{displayTitle}</Text>
        ) : null}

        {/* Step N/M · 약 N분 남음 */}
        <Text style={styles.stepProgress}>
          Step {currentStep + 1}/{activeSteps.length}
          {estimatedMin > 0 ? `  ·  약 ${estimatedMin}분 남음` : ''}
        </Text>

        {/* 뱃지 + 단계 소요시간 */}
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, isWaitStep ? styles.typeWait : styles.typeActive]}>
            <Text style={styles.typeEmoji}>{isWaitStep ? '⏱️' : '🔥'}</Text>
            <Text style={styles.typeLabel}>{isWaitStep ? '대기' : '조리'}</Text>
          </View>
          {stepDurationLabel ? (
            <Text style={styles.stepDuration}>{stepDurationLabel}</Text>
          ) : null}
        </View>

        {/* 단계별 사진 (있을 때만) */}
        {stepImageUrl ? (
          <Image
            source={{ uri: stepImageUrl }}
            style={styles.stepImage}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={300}
          />
        ) : null}

        {/* 단계 설명 */}
        <Text style={styles.stepDesc}>{step?.description}</Text>

        {/* WAIT 단계: CircularTimer */}
        {isWaitStep && remaining != null && (
          <CircularTimer
            total={(step as any).durationSeconds ?? 60}
            remaining={remaining}
          />
        )}

        {/* WAIT 상태 텍스트 */}
        {isWaitStep && (
          <Text style={[styles.waitHint, timerDone && styles.waitHintDone]}>
            {timerDone ? '타이머 완료!' : '기다리는 중이에요...'}
          </Text>
        )}

        {/* 다음 단계 미리보기 */}
        {isLastStep ? (
          <Text style={styles.nextPreviewText}>마지막 단계예요!</Text>
        ) : nextStep ? (
          <Text style={styles.nextPreviewText} numberOfLines={2}>
            다음: {(nextStep as any).description}
          </Text>
        ) : null}
      </ScrollView>

      {/* ─── Controls (하단 고정) ─── */}
      <View style={styles.controlsArea}>
        {/* 메인 버튼: 다음/완료 */}
        <TouchableOpacity
          style={[styles.mainBtn, isWaiting && styles.mainBtnDisabled]}
          onPress={() => {
            if (isWaiting) return;
            ttsService.stop();
            const engine = engineRef.current;
            if (engine.getStatus() === 'PAUSED') engine.resume();
            engine.next();
          }}
          disabled={isWaiting}
          activeOpacity={0.8}
        >
          <Text style={[styles.mainBtnText, isWaiting && styles.mainBtnTextDisabled]}>
            {isLastStep ? '완료' : '다음'}
          </Text>
        </TouchableOpacity>

        {/* 보조 버튼: 이전 · 일시정지 · 반복 */}
        <View style={styles.subBtnRow}>
          <TouchableOpacity
            style={[styles.subBtn, currentStep === 0 && styles.subBtnDisabled]}
            onPress={() => {
              if (currentStep > 0) {
                ttsService.stop();
                const engine = engineRef.current;
                if (engine.getStatus() === 'PAUSED') engine.resume();
                engine.prev();
              }
            }}
            disabled={currentStep === 0}
          >
            <View style={styles.subBtnIcon}>
              <Text style={styles.subBtnEmoji}>⏮️</Text>
            </View>
            <Text style={styles.subBtnLabel}>이전</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subBtn}
            onPress={() => {
              const engine = engineRef.current;
              if (engine.getStatus() === 'PAUSED') {
                engine.resume();
                ttsService.resume();
              } else {
                ttsService.pause();
                engine.pause();
              }
            }}
          >
            <View style={styles.subBtnIcon}>
              <Text style={styles.subBtnEmoji}>
                {status === 'PAUSED' ? '▶️' : '⏸️'}
              </Text>
            </View>
            <Text style={styles.subBtnLabel}>
              {status === 'PAUSED' ? '재개' : '일시정지'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subBtn}
            onPress={() => {
              ttsService.stop();
              const engine = engineRef.current;
              if (engine.getStatus() === 'PAUSED') engine.resume();
              engine.repeat();
            }}
          >
            <View style={styles.subBtnIcon}>
              <Text style={styles.subBtnEmoji}>🔄</Text>
            </View>
            <Text style={styles.subBtnLabel}>반복</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.voiceHint}>
          🎙️ "다음" 또는 "반복"이라고 말해보세요
        </Text>
      </View>
    </SafeAreaView>
  );
}

/** 단계별 소요시간 → "이 단계 약 N분" 문자열 */
function formatStepDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  if (seconds < 60) return '이 단계 약 1분 이내';
  if (seconds < 3600) return `이 단계 약 ${Math.ceil(seconds / 60)}분`;
  const h = Math.floor(seconds / 3600);
  const m = Math.ceil((seconds % 3600) / 60);
  return m > 0 ? `이 단계 약 ${h}시간 ${m}분` : `이 단계 약 ${h}시간`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quit: { fontSize: 24, color: '#FFFFFF' },
  stepCounter: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  elapsedInline: { fontSize: 11, color: '#4B5563', fontWeight: '400' },

  // ─── Progress ───
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },

  // ─── Body ───
  body: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  bodyCentered: {
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepProgress: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeActive: { backgroundColor: 'rgba(255,107,53,0.2)' },
  typeWait: { backgroundColor: 'rgba(255,191,0,0.2)' },
  typeEmoji: { fontSize: 14 },
  typeLabel: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  stepDuration: { fontSize: 13, color: '#9CA3AF' },

  // 단계별 사진
  stepImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#2a2a3e',
  },

  stepDesc: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 16,
  },
  waitHint: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  waitHintDone: { color: '#2EC4B6', fontWeight: '700' },
  nextPreviewText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 16,
  },

  // ─── Controls ───
  controlsArea: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  mainBtn: {
    backgroundColor: '#FF6B35',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnDisabled: { backgroundColor: '#4B5563' },
  mainBtnText: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  mainBtnTextDisabled: { color: '#9CA3AF' },

  subBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginTop: 12,
  },
  subBtn: { alignItems: 'center', gap: 4 },
  subBtnDisabled: { opacity: 0.3 },
  subBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBtnEmoji: { fontSize: 20 },
  subBtnLabel: { fontSize: 11, color: '#9CA3AF' },

  voiceHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    paddingTop: 8,
    paddingBottom: 8,
  },
});
