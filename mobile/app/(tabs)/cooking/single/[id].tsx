import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useKeepAwake } from 'expo-keep-awake';
import { Colors } from '../../../../src/constants/colors';
import { Loading } from '../../../../src/components/common/Loading';
import { ErrorScreen } from '../../../../src/components/common/ErrorScreen';
import { recipeApi } from '../../../../src/api/recipeApi';
import { coachingApi } from '../../../../src/api/coachingApi';
import { CoachingEngine } from '../../../../src/engines/CoachingEngine';
import { ttsService } from '../../../../src/services/TTSService';
import { sttService } from '../../../../src/services/STTService';
import { useAuthStore } from '../../../../src/stores/authStore';
import { formatTime } from '../../../../src/utils/format';
import type { CoachingStatus } from '../../../../src/types/coaching';

export default function SingleCookingScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const engineRef = useRef(new CoachingEngine());

  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<CoachingStatus>('IDLE');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const coachingIdRef = useRef<number | null>(null);

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await recipeApi.getDetail(Number(id));
      return res.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!recipe) return;

    // Start coaching log on the server
    coachingApi.start({
      mode: 'single',
      recipeIds: [Number(id)],
    }).then((res) => {
      coachingIdRef.current = res.data.data.id;
    }).catch(() => {
      // Non-blocking: coaching log creation failure shouldn't prevent cooking
    });

    const engine = engineRef.current;
    engine.init(recipe.steps);

    const unsub = engine.on((event) => {
      switch (event.type) {
        case 'STEP_CHANGED':
          setCurrentStep(event.step);
          setRemaining(null);
          // TTS for the step
          if (user?.coachingEnabled !== false) {
            const step = recipe.steps[event.step];
            ttsService.speak(
              `${event.step + 1}단계. ${step.description}`,
            );
          }
          break;
        case 'STATUS_CHANGED':
          setStatus(event.status);
          break;
        case 'TIMER_TICK':
          setRemaining(event.remaining);
          break;
        case 'TIMER_DONE':
          if (user?.coachingEnabled !== false) {
            ttsService.speak('타이머가 완료되었습니다. 다음 단계를 확인하세요.');
          }
          break;
        case 'COMPLETED':
          router.replace({
            pathname: '/(tabs)/cooking/complete',
            params: {
              recipeId: id,
              elapsed: String(elapsed),
              coachingId: String(coachingIdRef.current ?? ''),
            },
          });
          break;
      }
    });

    engine.start();

    // Elapsed timer
    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    // STT
    if (user?.coachingEnabled !== false) {
      sttService.startListening((cmd) => {
        if (cmd === 'next') engine.next();
        else if (cmd === 'repeat') engine.repeat();
      });
    }

    return () => {
      unsub();
      clearInterval(elapsedTimer);
      engine.destroy();
      ttsService.stop();
      sttService.stopListening();
    };
  }, [recipe, id, user?.coachingEnabled, user?.coachingVoiceSpeed]);

  // Set TTS speed
  useEffect(() => {
    ttsService.setSpeed(user?.coachingVoiceSpeed ?? 1.0);
  }, [user?.coachingVoiceSpeed]);

  const handleQuit = () => {
    Alert.alert('코칭 종료', '정말 코칭을 종료하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '종료',
        style: 'destructive',
        onPress: () => {
          engineRef.current.destroy();
          ttsService.stop();
          sttService.stopListening();
          router.back();
        },
      },
    ]);
  };

  if (isLoading) return <Loading message="레시피를 불러오는 중..." />;
  if (error || !recipe) return <ErrorScreen />;

  const step = recipe.steps[currentStep];
  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit}>
          <Text style={styles.quit}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.elapsed}>{formatTime(elapsed)}</Text>
        <Text style={styles.stepCounter}>
          {currentStep + 1}/{recipe.steps.length}
        </Text>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <View style={styles.body}>
        <View
          style={[
            styles.typeIcon,
            step?.stepType === 'WAIT' ? styles.typeWait : styles.typeActive,
          ]}
        >
          <Text style={styles.typeEmoji}>
            {step?.stepType === 'WAIT' ? '⏱️' : '🔥'}
          </Text>
          <Text style={styles.typeLabel}>
            {step?.stepType === 'WAIT' ? '대기' : '조리'}
          </Text>
        </View>

        <Text style={styles.stepTitle}>Step {currentStep + 1}</Text>
        <Text style={styles.stepDesc}>{step?.description}</Text>

        {status === 'WAITING' && remaining != null && (
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(remaining)}</Text>
            <Text style={styles.timerLabel}>남은 시간</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => engineRef.current.repeat()}
        >
          <Text style={styles.controlEmoji}>🔄</Text>
          <Text style={styles.controlLabel}>반복</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, styles.nextBtn]}
          onPress={() => engineRef.current.next()}
        >
          <Text style={styles.nextText}>
            {currentStep >= recipe.steps.length - 1 ? '완료' : '다음'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() =>
            status === 'PAUSED'
              ? engineRef.current.resume()
              : engineRef.current.pause()
          }
        >
          <Text style={styles.controlEmoji}>
            {status === 'PAUSED' ? '▶️' : '⏸️'}
          </Text>
          <Text style={styles.controlLabel}>
            {status === 'PAUSED' ? '재개' : '일시정지'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.voiceHint}>
        🎙️ "다음" 또는 "반복"이라고 말해보세요
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.timerBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quit: {
    fontSize: 24,
    color: Colors.white,
  },
  elapsed: {
    fontSize: 16,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  stepCounter: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  typeIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeActive: {
    backgroundColor: 'rgba(255,107,53,0.2)',
  },
  typeWait: {
    backgroundColor: 'rgba(46,196,182,0.2)',
  },
  typeEmoji: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 18,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  stepDesc: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  timerText: {
    fontSize: 36,
    color: Colors.white,
    fontWeight: '700',
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 4,
  },
  controlEmoji: {
    fontSize: 28,
  },
  controlLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  nextText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
  },
  voiceHint: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textTertiary,
    paddingBottom: 20,
  },
});
