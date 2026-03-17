import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const STAGES = [
  { label: '음성 추출 중...', emoji: '🎵', endSec: 5, endPct: 0.3 },
  { label: '음성 인식 중...', emoji: '🎤', endSec: 12, endPct: 0.65 },
  { label: '레시피 구성 중...', emoji: '📝', endSec: 25, endPct: 0.95 },
] as const;

const ESTIMATED_TOTAL = 18; // 예상 총 소요 시간 (초)

interface Props {
  startedAt: number;
  isDone: boolean;
}

export function ConvertingProgress({ startedAt, isDone }: Props) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [elapsed, setElapsed] = useState(0);

  // 1초 간격 elapsed 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // 프로그레스 바 애니메이션
  useEffect(() => {
    if (isDone) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      return;
    }

    const target = getProgressForElapsed(elapsed);
    Animated.timing(progressAnim, {
      toValue: target,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [elapsed, isDone, progressAnim]);

  const stageIndex = getStageIndex(elapsed);
  const stage = STAGES[stageIndex];
  const remaining = Math.max(0, ESTIMATED_TOTAL - elapsed);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* 이모지 */}
      <Text style={styles.emoji}>{stage.emoji}</Text>

      {/* 단계 라벨 */}
      <Text style={styles.stageLabel}>{stage.label}</Text>

      {/* 프로그레스 바 */}
      <View style={styles.barContainer}>
        <View style={styles.barBg}>
          <Animated.View style={[styles.barFill, { width: barWidth }]} />
        </View>
        <Text style={styles.pctText}>
          {isDone ? '100%' : `${Math.round(getProgressForElapsed(elapsed) * 100)}%`}
        </Text>
      </View>

      {/* 3단계 인디케이터 */}
      <View style={styles.steps}>
        {STAGES.map((s, i) => (
          <View key={i} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                i <= stageIndex && styles.stepDotActive,
                i < stageIndex && styles.stepDotDone,
              ]}
            >
              {i < stageIndex && <Text style={styles.stepCheck}>✓</Text>}
            </View>
            <Text
              style={[
                styles.stepLabel,
                i <= stageIndex && styles.stepLabelActive,
              ]}
            >
              {s.label.replace(' 중...', '')}
            </Text>
          </View>
        ))}
      </View>

      {/* 예상 시간 */}
      {!isDone && (
        <Text style={styles.remaining}>
          {remaining > 0 ? `약 ${remaining}초 남음` : '거의 완료...'}
        </Text>
      )}

    </View>
  );
}

function getStageIndex(elapsed: number): number {
  if (elapsed < STAGES[0].endSec) return 0;
  if (elapsed < STAGES[1].endSec) return 1;
  return 2;
}

function getProgressForElapsed(elapsed: number): number {
  for (let i = 0; i < STAGES.length; i++) {
    const startSec = i === 0 ? 0 : STAGES[i - 1].endSec;
    const startPct = i === 0 ? 0 : STAGES[i - 1].endPct;

    if (elapsed < STAGES[i].endSec) {
      const ratio = (elapsed - startSec) / (STAGES[i].endSec - startSec);
      return startPct + ratio * (STAGES[i].endPct - startPct);
    }
  }

  // 마지막 단계 이후: 로그 곡선으로 95%에 점근
  const overTime = elapsed - STAGES[2].endSec;
  return 0.95 + 0.04 * (1 - 1 / (1 + overTime * 0.1));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  stageLabel: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  // 프로그레스 바
  barContainer: {
    width: '100%',
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  barBg: {
    width: '100%',
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  pctText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  // 3단계 인디케이터
  steps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    borderColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCheck: {
    fontSize: 13,
    color: colors.textInverse,
    fontWeight: '700',
  },
  stepLabel: {
    ...typography.small,
    color: colors.textTertiary,
  },
  stepLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  // 남은 시간
  remaining: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
