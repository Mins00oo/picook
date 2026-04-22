import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../../../src/constants/theme';
import { Loading } from '../../../src/components/common/Loading';
import { useAttendanceHistory } from '../../../src/hooks/useAttendance';

const KO_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function AttendanceScreen() {
  const router = useRouter();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const monthKey = `${cursor.year}-${String(cursor.month).padStart(2, '0')}`;
  const { data, isLoading } = useAttendanceHistory(monthKey);

  const gridDays = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const checkedSet = useMemo(
    () => new Set(data?.checkedDates ?? []),
    [data],
  );
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const goPrevMonth = () => {
    setCursor((c) => {
      if (c.month === 1) return { year: c.year - 1, month: 12 };
      return { ...c, month: c.month - 1 };
    });
  };
  const goNextMonth = () => {
    setCursor((c) => {
      const now = new Date();
      const isCurrent = c.year === now.getFullYear() && c.month === now.getMonth() + 1;
      if (isCurrent) return c;
      if (c.month === 12) return { year: c.year + 1, month: 1 };
      return { ...c, month: c.month + 1 };
    });
  };

  if (isLoading) return <Loading />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>출석 현황</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.stats}>
          <StatCell label="현재 연속" value={data?.currentStreak ?? 0} unit="일" accent />
          <View style={styles.statDivider} />
          <StatCell label="최장 연속" value={data?.longestStreak ?? 0} unit="일" />
          <View style={styles.statDivider} />
          <StatCell label="누적 출석" value={Number(data?.totalDays ?? 0)} unit="일" />
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.monthBtn} onPress={goPrevMonth}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {cursor.year}년 {cursor.month}월
            </Text>
            <TouchableOpacity style={styles.monthBtn} onPress={goNextMonth}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path d="M9 18l6-6-6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.weekHeader}>
            {KO_DAYS.map((d, i) => (
              <Text
                key={d}
                style={[
                  styles.weekHeaderText,
                  i === 0 && { color: '#EF4444' },
                  i === 6 && { color: '#3B82F6' },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {gridDays.map((cell, i) => {
              if (!cell) return <View key={i} style={styles.cell} />;
              const dateKey = `${cursor.year}-${String(cursor.month).padStart(2, '0')}-${String(cell).padStart(2, '0')}`;
              const isToday = dateKey === today;
              const isChecked = checkedSet.has(dateKey);
              return (
                <View key={i} style={styles.cell}>
                  <View
                    style={[
                      styles.cellInner,
                      isChecked && styles.cellChecked,
                      isToday && !isChecked && styles.cellToday,
                    ]}
                  >
                    <Text style={[
                      styles.cellText,
                      isChecked && styles.cellTextChecked,
                      isToday && !isChecked && { color: colors.primary, fontFamily: fontFamily.bold },
                    ]}>
                      {cell}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>출석 완료</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { borderColor: colors.primary, backgroundColor: 'transparent', borderWidth: 1.5 }]} />
            <Text style={styles.legendText}>오늘</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.line }]} />
            <Text style={styles.legendText}>미출석</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({
  label, value, unit, accent,
}: { label: string; value: number; unit: string; accent?: boolean }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
        <Text style={[styles.statValue, accent && { color: colors.primary }]}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const grid: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  navTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.textPrimary },

  stats: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
    ...shadow.sm,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  statValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statUnit: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  statDivider: { width: 1, backgroundColor: colors.line, marginVertical: 4 },

  calendar: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.sm,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  monthText: { ...typography.h3, fontSize: 15, color: colors.textPrimary, fontFamily: fontFamily.bold },

  weekHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textSecondary,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 8 },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInner: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellChecked: {
    backgroundColor: colors.primary,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cellText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  cellTextChecked: { color: '#fff', fontFamily: fontFamily.bold },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 12,
    paddingVertical: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
