import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useKeepAwake } from 'expo-keep-awake';
import { Colors } from '../../../src/constants/colors';
import { Loading } from '../../../src/components/common/Loading';
import { recipeApi } from '../../../src/api/recipeApi';
import { TimelineEngine, TimelineItem } from '../../../src/engines/TimelineEngine';
import { ttsService } from '../../../src/services/TTSService';
import { TimerManager } from '../../../src/engines/TimerManager';
import { useAuthStore } from '../../../src/stores/authStore';
import { formatTime } from '../../../src/utils/format';

export default function MultiCookingScreen() {
  useKeepAwake();
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const recipeIds = (ids ?? '').split(',').map(Number);
  const timerRef = useRef(new TimerManager());

  const [currentIdx, setCurrentIdx] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const queries = recipeIds.map((rid) =>
    useQuery({
      queryKey: ['recipe', String(rid)],
      queryFn: async () => {
        const res = await recipeApi.getDetail(rid);
        return res.data.data;
      },
    }),
  );

  const isLoading = queries.some((q) => q.isLoading);
  const recipes = queries.map((q) => q.data).filter(Boolean);

  useEffect(() => {
    if (recipes.length < 2) return;
    const tl = TimelineEngine.generate(
      recipes.map((r) => ({ title: r!.title, steps: r!.steps })),
    );
    setTimeline(tl);
  }, [recipes.length]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeline.length === 0 || currentIdx >= timeline.length) return;
    const item = timeline[currentIdx];
    if (user?.coachingEnabled !== false) {
      ttsService.speak(
        `${item.recipeTitle}. ${item.step.stepNumber}단계. ${item.step.description}`,
      );
    }
    if (item.step.type === 'WAIT' && item.step.durationSeconds) {
      timerRef.current.start(
        item.step.durationSeconds,
        (r) => setRemaining(r),
        () => {
          setRemaining(null);
          if (user?.coachingEnabled !== false) {
            ttsService.speak('타이머 완료. 다음 단계를 확인하세요.');
          }
        },
      );
    } else {
      setRemaining(null);
    }
  }, [currentIdx, timeline]);

  const handleNext = () => {
    timerRef.current.stop();
    if (currentIdx >= timeline.length - 1) {
      router.replace({
        pathname: '/(tabs)/cooking/complete',
        params: { recipeId: String(recipeIds[0]), elapsed: String(elapsed) },
      });
      return;
    }
    setCurrentIdx((p) => p + 1);
  };

  const handleQuit = () => {
    Alert.alert('코칭 종료', '정말 코칭을 종료하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '종료',
        style: 'destructive',
        onPress: () => {
          timerRef.current.destroy();
          ttsService.stop();
          router.back();
        },
      },
    ]);
  };

  if (isLoading || timeline.length === 0) return <Loading message="준비 중..." />;

  const item = timeline[currentIdx];
  const progress = ((currentIdx + 1) / timeline.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit}>
          <Text style={styles.quit}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.elapsed}>{formatTime(elapsed)}</Text>
        <Text style={styles.stepCounter}>{currentIdx + 1}/{timeline.length}</Text>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <View style={styles.miniBar}>
        {recipes.map((r, i) => (
          <View
            key={i}
            style={[
              styles.miniItem,
              item?.recipeIndex === i && styles.miniItemActive,
            ]}
          >
            <View
              style={[
                styles.miniDot,
                { backgroundColor: i === 0 ? Colors.primary : Colors.secondary },
              ]}
            />
            <Text style={styles.miniText} numberOfLines={1}>{r!.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.body}>
        <Text style={styles.recipeLabel}>{item.recipeTitle}</Text>
        <View
          style={[
            styles.typeBadge,
            item.step.type === 'WAIT' ? styles.typeWait : styles.typeActive,
          ]}
        >
          <Text style={styles.typeText}>
            {item.step.type === 'WAIT' ? '⏱️ 대기' : '🔥 조리'}
          </Text>
        </View>
        <Text style={styles.stepDesc}>{item.step.description}</Text>

        {remaining != null && (
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(remaining)}</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlBtn, styles.nextBtn]} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIdx >= timeline.length - 1 ? '완료' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.timerBg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  quit: { fontSize: 24, color: Colors.white },
  elapsed: { fontSize: 16, color: Colors.textTertiary, fontWeight: '600' },
  stepCounter: { fontSize: 16, color: Colors.white, fontWeight: '600' },
  progressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 20, borderRadius: 2 },
  progressBar: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  miniBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  miniItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  miniItemActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  miniText: { fontSize: 13, color: Colors.white, flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  recipeLabel: { fontSize: 14, color: Colors.textTertiary, fontWeight: '600' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  typeActive: { backgroundColor: 'rgba(255,107,53,0.2)' },
  typeWait: { backgroundColor: 'rgba(46,196,182,0.2)' },
  typeText: { fontSize: 14, color: Colors.white, fontWeight: '600' },
  stepDesc: { fontSize: 22, color: Colors.white, fontWeight: '700', textAlign: 'center', lineHeight: 32 },
  timerCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  timerText: { fontSize: 32, color: Colors.white, fontWeight: '700' },
  controls: { paddingVertical: 20, paddingHorizontal: 20, alignItems: 'center' },
  controlBtn: { alignItems: 'center' },
  nextBtn: { backgroundColor: Colors.primary, paddingVertical: 18, paddingHorizontal: 64, borderRadius: 30 },
  nextText: { fontSize: 18, color: Colors.white, fontWeight: '700' },
});
