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
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/stores/authStore';
import { userApi } from '../../../src/api/userApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CharacterOutfit } from '../../../src/components/brand/CharacterOutfit';
import {
  useOutfitCatalog,
  useOutfitMe,
  useEquippedImages,
  useEquipMutation,
} from '../../../src/hooks/useOutfits';
import { OUTFIT_SLOTS, SLOT_LABEL } from '../../../src/types/outfit';
import type { Outfit, OutfitSlot } from '../../../src/types/outfit';
import type { CharacterType } from '../../../src/types/user';
import { getCharacterName } from '../../../src/constants/characters';
import { toAbsoluteImageUrl } from '../../../src/utils/format';

const CHARACTERS: CharacterType[] = ['MIN', 'ROO', 'HARU'];

export default function ClosetScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const characterType = user?.characterType ?? 'MIN';

  const [selectedSlot, setSelectedSlot] = useState<OutfitSlot>('top');

  const { data: catalog = [] } = useOutfitCatalog();
  const { data: me } = useOutfitMe();
  const equippedImages = useEquippedImages(me?.equipped, catalog);
  const equipMutation = useEquipMutation();

  const ownedIds = useMemo(() => new Set((me?.owned ?? []).map((o) => o.outfitId)), [me]);
  const slotOutfits = useMemo(
    () => catalog.filter((o) => o.slot === selectedSlot),
    [catalog, selectedSlot],
  );

  const equippedInSlot = me?.equipped?.[selectedSlot] ?? null;

  const characterMutation = useMutation({
    mutationFn: async (ch: CharacterType) => (await userApi.updateMe({ characterType: ch })).data.data,
    onSuccess: (u) => {
      setUser(u);
      qc.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });

  const handleEquip = (o: Outfit) => {
    if (!ownedIds.has(o.id)) {
      if (o.unlockLevel != null) {
        Alert.alert('해금 필요', `Lv.${o.unlockLevel}에 도달하면 자동 지급돼요`);
      } else {
        Alert.alert('미보유', '상점에서 먼저 구매해주세요', [
          { text: '취소', style: 'cancel' },
          { text: '상점 가기', onPress: () => router.push('/(tabs)/mypage/shop') },
        ]);
      }
      return;
    }
    const isCurrent = equippedInSlot === o.id;
    equipMutation.mutate({ slot: selectedSlot, outfitId: isCurrent ? null : o.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.title}>내 의상</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <LinearGradient
          colors={['#FFECD8', '#FFE0C8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.preview}
        >
          <View style={styles.previewGlow} />
          <CharacterOutfit
            characterType={characterType}
            equipped={equippedImages}
            size={160}
          />
          <Text style={styles.characterName}>{getCharacterName(characterType)}</Text>
        </LinearGradient>

        {/* Character switcher */}
        <View style={styles.charSwitch}>
          {CHARACTERS.map((c) => {
            const active = c === characterType;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.charSeg, active && styles.charSegActive]}
                onPress={() => {
                  if (!active) characterMutation.mutate(c);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.charSegText, active && styles.charSegTextActive]}>
                  {getCharacterName(c)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Slot tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotTabs}>
          {OUTFIT_SLOTS.map((s) => {
            const active = s === selectedSlot;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.slotTab, active && styles.slotTabActive]}
                onPress={() => setSelectedSlot(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.slotTabText, active && styles.slotTabTextActive]}>
                  {SLOT_LABEL[s]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Outfit grid */}
        {slotOutfits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👘</Text>
            <Text style={styles.emptyTitle}>이 슬롯의 의상이 아직 없어요</Text>
            <Text style={styles.emptyDesc}>곧 새로운 의상이 추가될 거예요</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {slotOutfits.map((o) => {
              const owned = ownedIds.has(o.id);
              const equipped = equippedInSlot === o.id;
              const isTargetPending =
                equipMutation.isPending && equipMutation.variables?.slot === selectedSlot;
              return (
                <OutfitTile
                  key={o.id}
                  outfit={o}
                  owned={owned}
                  equipped={equipped}
                  pending={isTargetPending}
                  disabled={equipMutation.isPending}
                  onPress={() => handleEquip(o)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OutfitTile({
  outfit, owned, equipped, pending, disabled, onPress,
}: {
  outfit: Outfit;
  owned: boolean;
  equipped: boolean;
  pending: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const uri = toAbsoluteImageUrl(outfit.imageUrl);
  return (
    <TouchableOpacity
      style={[
        styles.tile,
        equipped && styles.tileEquipped,
        !owned && styles.tileLocked,
        pending && styles.tilePending,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <View style={styles.tileImgWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.tileImg} contentFit="contain" />
        ) : (
          <View style={styles.tileImgEmpty}>
            <Svg width={26} height={26} viewBox="0 0 24 24">
              <Path d="M6 4h12l-2 16H8L6 4z" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        )}
        {!owned && (
          <View style={styles.lockOverlay}>
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z"
                stroke="#fff"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        )}
        {equipped && (
          <View style={styles.equippedBadge}>
            <Text style={styles.equippedBadgeText}>장착 중</Text>
          </View>
        )}
      </View>
      <Text style={styles.tileName} numberOfLines={1}>{outfit.name}</Text>
      <Text style={styles.tileMeta} numberOfLines={1}>
        {owned
          ? equipped ? '탭하여 해제' : '탭하여 착용'
          : outfit.unlockLevel != null
            ? `Lv.${outfit.unlockLevel} 달성`
            : `${outfit.pricePoints}P`}
      </Text>
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

  // Preview
  preview: {
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 14,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  previewGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,107,74,0.12)',
    top: 20,
  },
  characterName: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginTop: 10,
  },

  // Character switcher
  charSwitch: {
    marginHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    backgroundColor: colors.lineSoft,
    borderRadius: 100,
    padding: 3,
    gap: 2,
  },
  charSeg: {
    flex: 1,
    height: 36,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charSegActive: {
    backgroundColor: colors.inkDark,
    ...shadow.sm,
  },
  charSegText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  charSegTextActive: {
    color: '#fff',
    fontFamily: fontFamily.bold,
  },

  // Slot tabs
  slotTabs: {
    paddingHorizontal: 16,
    gap: 6,
    paddingVertical: 4,
  },
  slotTab: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTabActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  slotTabText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  slotTabTextActive: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  tile: {
    width: '31%',
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    gap: 4,
  },
  tileEquipped: {
    borderColor: colors.primary,
    backgroundColor: colors.accentSoft,
  },
  tileLocked: {
    opacity: 0.7,
  },
  tilePending: {
    opacity: 0.55,
  },
  tileImgWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  tileImg: { width: '80%', height: '80%' },
  tileImgEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,22,18,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  equippedBadgeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 8,
    color: '#fff',
    letterSpacing: 0.3,
  },
  tileName: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  tileMeta: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: -0.1,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
    gap: 6,
  },
  emptyEmoji: { fontSize: 42, marginBottom: 4 },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptyDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
