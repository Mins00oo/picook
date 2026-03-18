import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../src/constants/colors';
import { Button } from '../../src/components/common/Button';
import { Loading } from '../../src/components/common/Loading';
import { recipeApi } from '../../src/api/recipeApi';
import { TimelineEngine } from '../../src/engines/TimelineEngine';
import { formatTime } from '../../src/utils/format';

export default function MultiPreviewScreen() {
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const recipeIds = (ids ?? '').split(',').map(Number);

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

  if (isLoading) return <Loading message="타임라인 준비 중..." />;
  if (recipes.length < 2) return <Loading message="레시피를 불러오는 중..." />;

  const timeline = TimelineEngine.generate(
    recipes.map((r) => ({ title: r!.title, steps: r!.steps })),
  );
  const totalTime = TimelineEngine.getEstimatedTotalTime(timeline);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>타임라인 미리보기</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          총 {timeline.length}단계 · 예상 {formatTime(totalTime)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.timeline}>
        {timeline.map((item, i) => (
          <View key={i} style={styles.timelineItem}>
            <View
              style={[
                styles.recipeDot,
                { backgroundColor: item.recipeIndex === 0 ? Colors.primary : Colors.secondary },
              ]}
            />
            <View style={styles.timelineContent}>
              <Text style={styles.recipeLabel}>{item.recipeTitle}</Text>
              <Text style={styles.stepText}>
                {item.step.stepType === 'WAIT' ? '⏱️' : '🔥'} Step {item.step.stepNumber}: {item.step.description}
              </Text>
              {item.step.durationSeconds && (
                <Text style={styles.duration}>{formatTime(item.step.durationSeconds)}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="멀티 코칭 시작"
          onPress={() => router.replace({
            pathname: '/cooking/multi-cooking',
            params: { ids },
          })}
          size="large"
          style={styles.startBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  back: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  summaryRow: { paddingHorizontal: 20, paddingBottom: 12 },
  summaryText: { fontSize: 15, color: Colors.textSecondary },
  timeline: { padding: 20, gap: 16, paddingBottom: 100 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  recipeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineContent: { flex: 1, gap: 4 },
  recipeLabel: { fontSize: 12, color: Colors.textTertiary, fontWeight: '600' },
  stepText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  duration: { fontSize: 13, color: Colors.textSecondary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 32,
    backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  startBtn: { width: '100%' },
});
