import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../../../src/constants/theme';
import { EggIcon } from '../../../src/components/points/EggIcon';
import { usePointBalance, usePointHistory } from '../../../src/hooks/usePoints';
import { Loading } from '../../../src/components/common/Loading';
import type { PointHistoryItem } from '../../../src/api/pointApi';

const REASON_LABELS: Record<string, string> = {
  DAILY_CHECK: '매일 출석체크',
  COOKBOOK_ENTRY: '요리 기록 등록',
  SHOP_PURCHASE: '상점 구매',
  ADMIN_ADJUST: '관리자 조정',
};

const REASON_EMOJI: Record<string, string> = {
  DAILY_CHECK: '📅',
  COOKBOOK_ENTRY: '📖',
  SHOP_PURCHASE: '🛍️',
  ADMIN_ADJUST: '⚙️',
};

export default function PointsScreen() {
  const router = useRouter();
  const { data: balance = 0, isLoading: balLoading } = usePointBalance();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePointHistory();

  const items = useMemo<PointHistoryItem[]>(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );

  const totalEarned = useMemo(
    () => items.filter((i) => i.amount > 0).reduce((s, i) => s + i.amount, 0),
    [items],
  );
  const totalSpent = useMemo(
    () => Math.abs(items.filter((i) => i.amount < 0).reduce((s, i) => s + i.amount, 0)),
    [items],
  );

  if (balLoading || isLoading) return <Loading />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>포인트 내역</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => <HistoryRow item={item} />}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHead}>
                <EggIcon size={28} withFace />
                <Text style={styles.balanceLabel}>현재 보유 포인트</Text>
              </View>
              <Text style={styles.balanceValue}>
                {balance.toLocaleString()}<Text style={styles.balanceUnit}>P</Text>
              </Text>
              <View style={styles.balanceStats}>
                <View style={styles.balanceStat}>
                  <Text style={styles.balanceStatLabel}>누적 적립</Text>
                  <Text style={styles.balanceStatValue}>+{totalEarned.toLocaleString()}P</Text>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceStat}>
                  <Text style={styles.balanceStatLabel}>누적 사용</Text>
                  <Text style={styles.balanceStatValue}>-{totalSpent.toLocaleString()}P</Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionLabel}>전체 내역</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <EggIcon size={48} withFace />
            <Text style={styles.emptyTitle}>아직 내역이 없어요</Text>
            <Text style={styles.emptyDesc}>출석체크하면 매일 +10P 적립돼요</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function HistoryRow({ item }: { item: PointHistoryItem }) {
  const positive = item.amount > 0;
  const when = new Date(item.createdAt);
  const date = `${when.getMonth() + 1}월 ${when.getDate()}일`;
  const time = when.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Text style={{ fontSize: 16 }}>{REASON_EMOJI[item.reason] ?? '📌'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowReason}>{REASON_LABELS[item.reason] ?? item.reason}</Text>
        <Text style={styles.rowDate}>{date} {time}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.rowAmount, { color: positive ? colors.success : colors.error }]}>
          {positive ? '+' : ''}{item.amount.toLocaleString()}P
        </Text>
        <Text style={styles.rowBalance}>{item.balanceAfter.toLocaleString()}P</Text>
      </View>
    </View>
  );
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

  balanceCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    borderWidth: 1.5,
    borderColor: colors.accent2,
    alignItems: 'center',
    ...shadow.sm,
    gap: 10,
  },
  balanceHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 40,
    color: colors.primary,
    letterSpacing: -1.5,
  },
  balanceUnit: { fontSize: 24, fontFamily: fontFamily.bold },
  balanceStats: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.accent2,
  },
  balanceStat: { flex: 1, alignItems: 'center', gap: 2 },
  balanceStatLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  balanceStatValue: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  balanceDivider: { width: 1, backgroundColor: colors.accent2 },

  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 18,
    marginBottom: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowReason: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  rowDate: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  rowAmount: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14,
    letterSpacing: -0.3,
  },
  rowBalance: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textTertiary,
    marginTop: 2,
  },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginTop: 6 },
  emptyDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
