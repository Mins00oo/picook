import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/stores/authStore';
import { getLevelForCount, getNextLevel, getLevelProgress } from '../../../src/constants/levels';
import { getCharacterName } from '../../../src/constants/characters';
import { Character } from '../../../src/components/brand/Character';
import { EggIcon } from '../../../src/components/points/EggIcon';
import { usePointBalance } from '../../../src/hooks/usePoints';
import { useFavorites } from '../../../src/hooks/useFavorites';

interface MenuItemDef {
  icon: React.ReactNode;
  bg: string;
  label: string;
  route: string;
  right?: string;
}

export default function MypageScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const count = user?.completedCookingCount ?? 0;
  const level = getLevelForCount(count);
  const nextLevel = getNextLevel(level);
  const progress = getLevelProgress(count);
  const characterType = user?.characterType ?? 'EGG';

  const { data: balance = 0 } = usePointBalance();
  const { data: favorites } = useFavorites();
  const favoritesCount = favorites?.length ?? 0;

  const MY_RECORD: MenuItemDef[] = [
    {
      icon: <Text style={{ fontSize: 18 }}>📖</Text>, bg: colors.accentSoft,
      label: '내 요리북', route: '/(tabs)/cookbook',
    },
    {
      icon: <Text style={{ fontSize: 18 }}>📅</Text>, bg: colors.mint,
      label: '출석 현황', route: '/(tabs)/mypage/attendance',
    },
    {
      icon: <EggIcon size={18} />, bg: colors.sun,
      label: '포인트 내역', route: '/(tabs)/mypage/points',
      right: `${balance}P`,
    },
  ];

  const SETTINGS: MenuItemDef[] = [
    {
      icon: <Text style={{ fontSize: 18 }}>👤</Text>, bg: colors.blue,
      label: '프로필 편집', route: '/(tabs)/mypage/profile',
    },
    {
      icon: <Text style={{ fontSize: 18 }}>⚙️</Text>, bg: colors.lineSoft,
      label: '앱 설정', route: '/(tabs)/mypage/settings',
    },
    {
      icon: <Text style={{ fontSize: 18 }}>🚪</Text>, bg: colors.lineSoft,
      label: '회원 탈퇴', route: '/(tabs)/mypage/delete-account',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>마이페이지</Text>

        {/* Profile card */}
        <LinearGradient
          colors={['#FFECD8', '#FFE0C8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Character type={characterType} size={60} withHat />
            </View>
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.nickname} numberOfLines={1}>
              {user?.displayName ?? '사용자'}
            </Text>
            <View style={styles.profileMetaRow}>
              <View style={styles.lvPill}>
                <Text style={styles.lvPillText}>Lv.{level.level} {level.title}</Text>
              </View>
              <Text style={styles.characterName}>{getCharacterName(characterType)}</Text>
            </View>
            <View style={styles.xpBarWrap}>
              <View style={[styles.xpFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.xpText}>
              {nextLevel
                ? `다음 레벨까지 ${nextLevel.min - count}회`
                : '최고 레벨 달성!'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/(tabs)/mypage/profile')}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>편집</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCell
            value={count}
            label="요리한 횟수"
            accent={false}
            onPress={() => router.push('/(tabs)/cookbook')}
          />
          <View style={styles.statsDivider} />
          <StatCell
            value={favoritesCount}
            label="찜한 요리"
            accent={false}
            onPress={() => router.push('/(tabs)/mypage/favorites')}
          />
          <View style={styles.statsDivider} />
          <StatCell
            value={balance}
            label="포인트"
            accent
            onPress={() => router.push('/(tabs)/mypage/points')}
          />
        </View>

        {/* Sections */}
        <MenuSection title="MY RECORD" items={MY_RECORD} onPress={(r) => router.push(r as any)} />
        <MenuSection title="SETTINGS" items={SETTINGS} onPress={(r) => router.push(r as any)} />
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
            {it.right && <Text style={styles.menuRight}>{it.right}</Text>}
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
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
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
  xpBarWrap: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  xpText: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  editBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.7)',
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
    fontSize: 10.5,
    color: colors.textTertiary,
    letterSpacing: 1,
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
    color: colors.primary,
    marginRight: 4,
  },
});
