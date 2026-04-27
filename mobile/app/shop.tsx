import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../src/constants/theme';
import { EggIcon } from '../src/components/points/EggIcon';
import {
  useOutfitCatalog,
  useOutfitMe,
  usePurchaseMutation,
} from '../src/hooks/useOutfits';
import { usePointBalance } from '../src/hooks/usePoints';
import { OUTFIT_SLOTS, SLOT_LABEL } from '../src/types/outfit';
import type { Outfit, OutfitSlot } from '../src/types/outfit';
import { toAbsoluteImageUrl } from '../src/utils/format';

type SlotFilter = 'all' | OutfitSlot;

export default function ShopScreen() {
  const router = useRouter();
  const [slotFilter, setSlotFilter] = useState<SlotFilter>('all');

  const { data: catalog = [] } = useOutfitCatalog();
  const { data: me } = useOutfitMe();
  const { data: balance = 0 } = usePointBalance();
  const purchaseMutation = usePurchaseMutation();

  const ownedIds = useMemo(() => new Set((me?.owned ?? []).map((o) => o.outfitId)), [me]);

  // 판매 대상: unlock_level == null (레벨 보상 전용 제외) + isActive
  const saleItems = useMemo(
    () => catalog.filter((o) => o.unlockLevel == null),
    [catalog],
  );

  const filtered = slotFilter === 'all'
    ? saleItems
    : saleItems.filter((o) => o.slot === slotFilter);

  const handlePurchase = (o: Outfit) => {
    if (ownedIds.has(o.id)) {
      Alert.alert('이미 보유', '이미 가지고 있는 의상이에요');
      return;
    }
    if (balance < o.pricePoints) {
      Alert.alert(
        '포인트 부족',
        `${o.pricePoints - balance}P가 부족해요.\n출석하고 요리 기록을 남겨 포인트를 모아보세요!`,
      );
      return;
    }
    Alert.alert(
      '의상 구매',
      `${o.name}을(를) ${o.pricePoints}P에 구매할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '구매',
          onPress: () => {
            purchaseMutation.mutate(o.id, {
              onSuccess: () => {
                Alert.alert('구매 완료', `'${o.name}'을(를) 받았어요!`, [
                  { text: '내 의상으로', onPress: () => router.push('/(tabs)/mypage/closet') },
                  { text: '계속 쇼핑', style: 'cancel' },
                ]);
              },
              onError: (e: any) => {
                const msg = e?.response?.data?.error?.message ?? '구매에 실패했어요';
                Alert.alert('오류', msg);
              },
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.title}>상점</Text>
        <View style={styles.balancePill}>
          <EggIcon size={14} />
          <Text style={styles.balanceText}>{balance}</Text>
        </View>
      </View>

      {/* Slot filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <FilterChip
          label="전체"
          active={slotFilter === 'all'}
          onPress={() => setSlotFilter('all')}
        />
        {OUTFIT_SLOTS.map((s) => (
          <FilterChip
            key={s}
            label={SLOT_LABEL[s]}
            active={slotFilter === s}
            onPress={() => setSlotFilter(s)}
          />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛍️</Text>
          <Text style={styles.emptyTitle}>준비 중이에요</Text>
          <Text style={styles.emptyDesc}>
            새로운 의상이 곧 등록돼요{'\n'}
            조금만 기다려주세요
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {filtered.map((o) => {
            const owned = ownedIds.has(o.id);
            const pending = purchaseMutation.isPending && purchaseMutation.variables === o.id;
            return (
              <ShopCard
                key={o.id}
                outfit={o}
                owned={owned}
                pending={pending}
                disabled={purchaseMutation.isPending}
                onPress={() => handlePurchase(o)}
              />
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ShopCard({
  outfit, owned, pending, disabled, onPress,
}: {
  outfit: Outfit;
  owned: boolean;
  pending: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const uri = toAbsoluteImageUrl(outfit.imageUrl);
  return (
    <TouchableOpacity
      style={[styles.card, owned && styles.cardOwned, pending && styles.cardPending]}
      onPress={onPress}
      disabled={disabled || owned}
      activeOpacity={0.85}
    >
      <View style={styles.cardImgWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.cardImg} contentFit="contain" />
        ) : (
          <View style={styles.cardImgEmpty}>
            <Svg width={32} height={32} viewBox="0 0 24 24">
              <Path d="M6 4h12l-2 16H8L6 4z" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        )}
        <View style={styles.slotBadge}>
          <Text style={styles.slotBadgeText}>{SLOT_LABEL[outfit.slot]}</Text>
        </View>
      </View>
      <Text style={styles.cardName} numberOfLines={1}>{outfit.name}</Text>
      <View style={styles.priceRow}>
        {pending ? (
          <Text style={styles.ownedText}>구매 중...</Text>
        ) : owned ? (
          <Text style={styles.ownedText}>보유중</Text>
        ) : (
          <>
            <EggIcon size={12} />
            <Text style={styles.priceText}>{outfit.pricePoints}P</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: { ...typography.pageTitle, color: colors.textPrimary },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 100,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 4,
  },
  balanceText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },

  filterRow: {
    paddingHorizontal: 16,
    gap: 6,
    paddingVertical: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.inkDark,
    borderColor: colors.inkDark,
  },
  filterChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.textPrimary,
  },
  filterChipTextActive: { color: '#fff' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    width: '47.5%',
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.sm,
    gap: 4,
  },
  cardOwned: {
    opacity: 0.65,
  },
  cardPending: {
    opacity: 0.6,
    borderColor: colors.primary,
  },
  cardImgWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImg: { width: '70%', height: '70%' },
  cardImgEmpty: { alignItems: 'center', justifyContent: 'center' },
  slotBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
  },
  slotBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 9.5,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  cardName: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: colors.primary,
    letterSpacing: -0.2,
  },
  ownedText: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textSecondary,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
