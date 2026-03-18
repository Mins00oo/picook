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
import { Colors } from '../../../src/constants/colors';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { CircularTimer } from '../../../src/components/coaching/CircularTimer';
import { recipeApi } from '../../../src/api/recipeApi';
import { coachingApi } from '../../../src/api/coachingApi';
import { CoachingEngine } from '../../../src/engines/CoachingEngine';
import { ttsService } from '../../../src/services/TTSService';
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

    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      unsub();
      clearInterval(elapsedTimer);
      engine.destroy();
      ttsService.stop();
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

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.quit}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.elapsed}>{formatTime(elapsed)}</Text>
        <Text style={styles.stepCounter}>
          {currentStep + 1}/{activeSteps.length}
        </Text>
      </View>

      {/* ─── Progress bar ─── */}
      <View style={styles.progressBg}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* ─── Body (scrollable) ─── */}
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* 요리명 */}
        {displayTitle ? (
          <Text style={styles.recipeTitle} numberOfLines={1}>{displayTitle}</Text>
        ) : null}

        {/* 예상 남은 시간 */}
        {estimatedMin > 0 && (
          <Text style={styles.estimatedTime}>약 {estimatedMin}분 남음</Text>
        )}

        {/* 단계 타입 뱃지 */}
        <View style={[styles.typeIcon, isWaitStep ? styles.typeWait : styles.typeActive]}>
          <Text style={styles.typeEmoji}>{isWaitStep ? '⏱️' : '🔥'}</Text>
          <Text style={styles.typeLabel}>{isWaitStep ? '대기' : '조리'}</Text>
        </View>

        {/* Step 번호 + 설명 */}
        <Text style={styles.stepTitle}>Step {currentStep + 1}</Text>
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
            {timerDone ? '타이머 완료! 🎉' : '기다리는 중이에요...'}
          </Text>
        )}

        {/* 다음 단계 미리보기 */}
        <View style={styles.nextPreview}>
          {isLastStep ? (
            <Text style={styles.nextPreviewText}>마지막 단계예요! 🎉</Text>
          ) : nextStep ? (
            <Text style={styles.nextPreviewText} numberOfLines={2}>
              다음: {(nextStep as any).description}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* ─── Controls (4버튼 고정 — 건드리지 않음) ─── */}
      <View style={styles.controls}>
        {/* 이전 단계 */}
        <TouchableOpacity
          style={[styles.controlBtn, currentStep === 0 && styles.controlDisabled]}
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
          <Text style={styles.controlEmoji}>⏮️</Text>
          <Text style={styles.controlLabel}>이전</Text>
        </TouchableOpacity>

        {/* 일시정지 / 재개 */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            const engine = engineRef.current;
            if (engine.getStatus() === 'PAUSED') {
              engine.resume();
              // 현재 단계 TTS 다시 읽기
              if (user?.coachingEnabled !== false) {
                const s = activeSteps[engine.getStepIndex()];
                if (s?.description) {
                  ttsService.speak(`${engine.getStepIndex() + 1}번째 단계. ${s.description}`).catch(() => {});
                }
              }
            } else {
              ttsService.stop();
              engine.pause();
            }
          }}
        >
          <Text style={styles.controlEmoji}>
            {status === 'PAUSED' ? '▶️' : '⏸️'}
          </Text>
          <Text style={styles.controlLabel}>
            {status === 'PAUSED' ? '재개' : '일시정지'}
          </Text>
        </TouchableOpacity>

        {/* 다음 / 완료 */}
        <TouchableOpacity
          style={[
            styles.controlBtn,
            styles.nextBtn,
            isWaiting && styles.nextBtnDisabled,
          ]}
          onPress={() => {
            if (isWaiting) return;
            ttsService.stop();
            const engine = engineRef.current;
            if (engine.getStatus() === 'PAUSED') engine.resume();
            engine.next();
          }}
          disabled={isWaiting}
        >
          <Text style={[styles.nextText, isWaiting && styles.nextTextDisabled]}>
            {isLastStep ? '완료' : '다음'}
          </Text>
        </TouchableOpacity>

        {/* 반복 */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            ttsService.stop();
            const engine = engineRef.current;
            if (engine.getStatus() === 'PAUSED') engine.resume();
            engine.repeat();
          }}
        >
          <Text style={styles.controlEmoji}>🔄</Text>
          <Text style={styles.controlLabel}>반복</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 음성 힌트 ─── */}
      <Text style={styles.voiceHint}>
        🎙️ "다음" 또는 "반복"이라고 말해보세요
      </Text>
    </SafeAreaView>
  );
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
  elapsed: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  stepCounter: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },

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
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 12,
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  estimatedTime: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  typeIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeActive: { backgroundColor: 'rgba(255,107,53,0.2)' },
  typeWait: { backgroundColor: 'rgba(255,191,0,0.2)' },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  stepTitle: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  stepDesc: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  waitHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  waitHintDone: {
    color: '#2EC4B6',
    fontWeight: '700',
  },
  nextPreview: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  nextPreviewText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  // ─── Controls (고정) ───
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  controlBtn: { alignItems: 'center', gap: 4 },
  controlDisabled: { opacity: 0.3 },
  controlEmoji: { fontSize: 28 },
  controlLabel: { fontSize: 12, color: '#9CA3AF' },
  nextBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 30,
  },
  nextBtnDisabled: {
    backgroundColor: '#4B5563',
  },
  nextText: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  nextTextDisabled: { color: '#9CA3AF' },

  // ─── Voice hint ───
  voiceHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    paddingBottom: 16,
  },
});
