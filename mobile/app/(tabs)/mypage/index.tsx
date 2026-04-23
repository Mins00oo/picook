import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/stores/authStore';
import { getLevelForExp, getNextLevel, getLevelExpSpan } from '../../../src/constants/levels';
import { getCharacterName } from '../../../src/constants/characters';
import { CharacterOutfit } from '../../../src/components/brand/CharacterOutfit';
import { EggIcon } from '../../../src/components/points/EggIcon';
import { usePointBalance } from '../../../src/hooks/usePoints';
import { useFavorites } from '../../../src/hooks/useFavorites';
import { useMonthlyCookingStats } from '../../../src/hooks/useMonthlyStats';
import { useOutfitMe, useOutfitCatalog, useEquippedImages } from '../../../src/hooks/useOutfits';

interface MenuItemDef {
  icon: React.ReactNode;
  bg: string;
  label: string;
  route: string;
  right?: string;
  rightAccent?: boolean;
  newBadge?: boolean;
}

export default function MypageScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const totalExp = user?.totalExp ?? 0;
  const level = getLevelForExp(totalExp);
  const nextLevel = getNextLevel(level);
  const { current: expInLevel, span: expSpan } = getLevelExpSpan(totalExp);
  const progress = expSpan > 0 ? Math.round((expInLevel / expSpan) * 100) : 100;
  const characterType = user?.characterType ?? 'MIN';

  const { data: balance = 0 } = usePointBalance();
  const { data: favorites } = useFavorites();
  const favoritesCount = favorites?.length ?? 0;
  const { data: monthly } = useMonthlyCookingStats();
  const { data: outfitMe } = useOutfitMe();
  const { data: catalog } = useOutfitCatalog();
  const equippedImages = useEquippedImages(outfitMe?.equipped, catalog);

  const SHOP: MenuItemDef[] = [
    {
      icon: <Text style={{ fontSize: 18 }}>🛍️</Text>, bg: colors.mint,
      label: '상점', route: '/(tabs)/mypage/shop', newBadge: true,
    },
    {
      icon: <Text style={{ fontSize: 18 }}>👗</Text>, bg: colors.blue,
      label: '내 의상', route: '/(tabs)/mypage/closet',
    },
    {
      icon: <EggIcon size={18} />, bg: colors.sun,
      label: '포인트 내역', route: '/(tabs)/mypage/points',
      right: `${balance}P`, rightAccent: true,
    },
  ];

  const ACTIVITY: MenuItemDef[] = [
    {
      icon: <Text style={{ fontSize: 18 }}>📖</Text>, bg: colors.accentSoft,
      label: '내 요리북', route: '/(tabs)/cookbook',
    },
    {
      icon: <Text style={{ fontSize: 18 }}>📅</Text>, bg: colors.mint,
      label: '출석 현황', route: '/(tabs)/mypage/attendance',
    },
    {
      icon: <Text style={{ fontSize: 18 }}>❤️</Text>, bg: colors.accentSoft,
      label: '찜한 레시피', route: '/(tabs)/mypage/favorites',
    },
  ];

  const ACCOUNT: MenuItemDef[] = [
    {
      icon: <Text style={{ fontSize: 18 }}>👤</Text>, bg: colors.blue,
      label: '프로필 편집', route: '/(tabs)/mypage/profile',
    },
    {
      icon: <Text style={{ fontSize: 18 }}>🚪</Text>, bg: colors.lineSoft,
      label: '회원 탈퇴', route: '/(tabs)/mypage/delete-account',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <Text style={styles.pageTitle}>마이페이지</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/(tabs)/mypage/settings')}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={3} stroke={colors.textSecondary} strokeWidth={1.8} />
            <Path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke={colors.textSecondary}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <LinearGradient
          colors={['#FFECD8', '#FFE0C8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          {/* Avatar with gradient ring */}
          <LinearGradient
            colors={['#FF6B4A', '#FFD255']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <CharacterOutfit
                characterType={characterType}
                equipped={equippedImages}
                size={58}
              />
            </View>
          </LinearGradient>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.nickname} numberOfLines={1}>
              {user?.displayName ?? '사용자'}
            </Text>
            <View style={styles.profileMetaRow}>
              <View style={styles.lvPill}>
                <Text style={styles.lvPillText}>Lv.{level.level}</Text>
              </View>
              <Text style={styles.characterName}>{getCharacterName(characterType)}</Text>
            </View>
            <View style={styles.xpHeaderRow}>
              <Text style={styles.xpHeaderLabel}>
                {nextLevel ? '다음 레벨까지' : '최고 레벨'}
              </Text>
              {nextLevel && (
                <Text style={styles.xpHeaderValue}>
                  <Text style={styles.xpHeaderValueB}>{expInLevel}</Text>
                  <Text> / {expSpan} EXP</Text>
                </Text>
              )}
            </View>
            <View style={styles.xpBarWrap}>
              <LinearGradient
                colors={['#FF6B4A', '#FFA56E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpFill, { width: `${progress}%` }]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/(tabs)/mypage/profile')}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>프로필 편집</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCell
            value={monthly?.monthlyCount ?? 0}
            label="이번 달 요리"
            accent={false}
            onPress={() => router.push('/(tabs)/cookbook')}
          />
          <View style={styles.statsDivider} />
          <StatCell
            value={favoritesCount}
            label="찜한 레시피"
            accent={false}
            onPress={() => router.push('/(tabs)/mypage/favorites')}
          />
          <View style={styles.statsDivider} />
          <StatCell
            value={balance}
            label="보유 포인트"
            accent
            onPress={() => router.push('/(tabs)/mypage/points')}
          />
        </View>

        {/* Sections */}
        <MenuSection title="상점 & 꾸미기" items={SHOP} onPress={(r) => router.push(r as any)} />
        <MenuSection title="활동" items={ACTIVITY} onPress={(r) => router.push(r as any)} />
        <MenuSection title="계정" items={ACCOUNT} onPress={(r) => router.push(r as any)} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({
  value, label, accent, onPress,
}: { value: number; label: string; accent: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.statCell} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.statValue, accent && { color: colors.primary }]}>{value}</Text>
      <View style={styles.statLabelRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Svg width={10} height={10} viewBox="0 0 24 24">
          <Path d="M9 18l6-6-6-6" stroke={colors.textTertiary} strokeWidth={2} strokeLinecap="round" fill="none" />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

function MenuSection({
  title, items, onPress,
}: { title: string; items: MenuItemDef[]; onPress: (route: string) => void }) {
  return (
    <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.menuCard}>
        {items.map((it, i) => (
          <TouchableOpacity
            key={it.label}
            style={[styles.menuRow, i !== items.length - 1 && styles.menuRowDivider]}
            onPress={() => onPress(it.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: it.bg }]}>{it.icon}</View>
            <Text style={styles.menuLabel}>{it.label}</Text>
            {it.newBadge && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
            {it.right && (
              <Text style={[styles.menuRight, it.rightAccent && { color: colors.primary }]}>
                {it.right}
              </Text>
            )}
            <Svg width={12} height={12} viewBox="0 0 24 24">
              <Path d="M9 18l6-6-6-6" stroke={colors.textTertiary} strokeWidth={2} strokeLinecap="round" fill="none" />
            </Svg>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Navbar (page title 16px + settings gear)
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  pageTitle: {
    ...typography.pageTitle,
    color: colors.textPrimary,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile card
  profileCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nickname: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  profileMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  lvPill: {
    backgroundColor: colors.inkDark,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  lvPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#fff',
  },
  characterName: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  xpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  xpHeaderLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  xpHeaderValue: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  xpHeaderValueB: {
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  xpBarWrap: {
    height: 6,
    backgroundColor: 'rgba(31,22,18,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
  },
  editBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.15)',
    alignSelf: 'flex-start',
  },
  editBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textPrimary,
  },

  // Stats
  statsRow: {
    marginTop: 14,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    ...shadow.sm,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  statLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  statsDivider: {
    width: 1,
    backgroundColor: colors.line,
    marginVertical: 6,
  },

  // Sections
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  menuRight: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginRight: 4,
  },
  newBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  newBadgeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
