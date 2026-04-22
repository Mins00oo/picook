import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, shadow, fontFamily } from '../../../src/constants/theme';
import { PicookLogo } from '../../../src/components/brand/PicookLogo';
import { Character } from '../../../src/components/brand/Character';
import { EggIcon } from '../../../src/components/points/EggIcon';
import { DailyCheckModal } from '../../../src/components/attendance/DailyCheckModal';
import { useAuthStore } from '../../../src/stores/authStore';
import { getLevelForCount } from '../../../src/constants/levels';
import { getCharacterName } from '../../../src/constants/characters';
import { useAttendanceToday, useCheckInMutation } from '../../../src/hooks/useAttendance';
import { usePointBalance } from '../../../src/hooks/usePoints';

function getTimeGreeting(): { label: string; kicker: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 10) return { label: '아침이네요!', kicker: '아침', emoji: '🌅' };
  if (h < 15) return { label: '점심이네요!', kicker: '점심', emoji: '🍜' };
  if (h < 18) return { label: '간식시간이에요!', kicker: '오후', emoji: '☕' };
  if (h < 22) return { label: '저녁이네요!', kicker: '저녁', emoji: '🍲' };
  return { label: '야식이네요!', kicker: '야식', emoji: '🌙' };
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const level = getLevelForCount(user?.completedCookingCount ?? 0);
  const greeting = useMemo(getTimeGreeting, []);
  const characterType = user?.characterType ?? 'EGG';

  const { data: balance = 0 } = usePointBalance();
  const { data: todayData } = useAttendanceToday(!!user);
  const checkInMutation = useCheckInMutation();
  const [modalOpen, setModalOpen] = useState(false);

  // 오늘 미출석이면 모달 자동 오픈 (앱 세션당 최대 1회)
  useEffect(() => {
    if (todayData && !todayData.checkedIn) {
      setModalOpen(true);
    }
  }, [todayData?.checkDate, todayData?.checkedIn]);

  const handleConfirmCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync();
      setModalOpen(false);
    } catch (e: any) {
      // 이미 체크인된 경우 (동시 탭 등) 모달만 닫고 무시
      const code = e?.response?.data?.error?.code;
      if (code === 'ATTENDANCE_ALREADY_CHECKED') {
        setModalOpen(false);
        return;
      }
      Alert.alert('오류', '출석체크에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const notReady = () =>
    Alert.alert('준비 중', '곧 만나요. 다음 업데이트를 기대해주세요 :)');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topbar}>
          <PicookLogo size={22} />
          <View style={styles.topRight}>
            <TouchableOpacity
              style={styles.eggPill}
              onPress={() => router.push('/(tabs)/mypage/points')}
              activeOpacity={0.85}
            >
              <EggIcon size={18} />
              <Text style={styles.candyCount}>{balance}</Text>
              {todayData && !todayData.checkedIn && <View style={styles.todayDot} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => router.push('/(tabs)/mypage/attendance')}
              activeOpacity={0.85}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={5} width={18} height={16} rx={2} stroke={colors.textPrimary} strokeWidth={1.7} />
                <Path d="M3 10h18" stroke={colors.textPrimary} strokeWidth={1.7} strokeLinecap="round" />
                <Path d="M8 3v4M16 3v4" stroke={colors.textPrimary} strokeWidth={1.7} strokeLinecap="round" />
                <Path d="M8 15l2 2 4-4" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" fill="none" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Character widget */}
        <View style={styles.charWidget}>
          <View style={styles.charArtWrap}>
            <View style={styles.blob} />
            <Character type={characterType} size={76} withHat />
          </View>
          <View style={styles.charTextArea}>
            <Text style={styles.charGreet}>
              {greeting.label}{' '}
              <Text style={styles.charGreetAccent}>오늘</Text>은 뭘 만들어볼까요?
            </Text>
            <View style={styles.charMetaRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.charMetaText}>{getCharacterName(characterType)}</Text>
              <View style={styles.lvPill}>
                <Text style={styles.lvPillText}>Lv.{level.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Hero */}
        <TouchableOpacity
          style={styles.heroWrap}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/home/select')}
        >
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.kicker}>
              <Text style={styles.kickerText}>TODAY</Text>
            </View>
            <Text style={styles.heroTitle}>
              오늘 <Text style={styles.heroTitleAccent}>뭐</Text> 먹지?
            </Text>
            <Text style={styles.heroDesc}>
              냉장고 속 재료로 만들 수 있는 요리를 추천해드려요
            </Text>
            <View style={styles.heroCta}>
              <Text style={styles.heroCtaText}>재료 고르고 추천받기</Text>
              <View style={styles.heroCtaArrow}>
                <Svg width={10} height={10} viewBox="0 0 24 24">
                  <Path d="M5 12h14M13 5l7 7-7 7" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" />
                </Svg>
              </View>
            </View>

            {/* Fridge illus */}
            <View style={styles.fridgeIllus}>
              <Svg width={68} height={80} viewBox="0 0 68 80">
                <Rect x={4} y={6} width={56} height={68} rx={9} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} />
                <Path d="M4 36H60" stroke="rgba(255,255,255,0.3)" strokeWidth={1.4} />
                <Rect x={12} y={16} width={3.5} height={7} rx={1} fill="rgba(255,255,255,0.45)" />
                <Rect x={12} y={44} width={3.5} height={9} rx={1} fill="rgba(255,255,255,0.45)" />
                <Circle cx={46} cy={20} r={2.5} fill="rgba(255,255,255,0.4)" />
                <Circle cx={40} cy={52} r={3.5} fill="rgba(255,255,255,0.4)" />
              </Svg>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Menu grid */}
        <View style={styles.menuGrid}>
          <MenuItem
            bg={colors.mint}
            stroke="#2E5D2A"
            label="내 냉장고"
            badge="8"
            onPress={notReady}
            iconType="fridge"
          />
          <MenuItem
            bg={colors.accentSoft}
            stroke="#C44A1C"
            label="오늘의 추천"
            onPress={() => router.push('/(tabs)/home/select')}
            iconType="today"
          />
          <MenuItem
            bg={colors.sun}
            stroke="#8B6B00"
            label="인기 요리"
            onPress={notReady}
            iconType="pop"
          />
          <MenuItem
            bg={colors.blue}
            stroke="#2F4E7A"
            label="찜한 요리"
            onPress={() => router.push('/(tabs)/favorites')}
            iconType="save"
          />
        </View>

        {/* 시간대별 추천 */}
        <View style={styles.timeSection}>
          <View style={styles.secHead}>
            <View style={styles.secHeadLeft}>
              <Text style={styles.secTitle}>{greeting.kicker}에 어울리는 한 끼</Text>
              <View style={styles.timePill}>
                <Text style={styles.timePillText}>
                  {greeting.emoji} {greeting.kicker}
                </Text>
              </View>
            </View>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>TOP 5</Text>
            </View>
          </View>

          <View style={styles.emptyRec}>
            <Text style={styles.emptyRecEmoji}>🍲</Text>
            <Text style={styles.emptyRecTitle}>맛있는 추천을 준비 중이에요</Text>
            <Text style={styles.emptyRecDesc}>곧 만나요 — 재료를 골라 직접 추천받아볼까요?</Text>
            <TouchableOpacity
              style={styles.emptyRecBtn}
              onPress={() => router.push('/(tabs)/home/select')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyRecBtnText}>재료 고르기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 매일 출석체크 모달 */}
      <DailyCheckModal
        visible={modalOpen}
        characterType={characterType}
        streakDays={todayData?.streakDays ?? 0}
        recentSevenDays={todayData?.recentSevenDays ?? [0, 0, 0, 0, 0, 0, 0]}
        isChecking={checkInMutation.isPending}
        onConfirm={handleConfirmCheckIn}
        onClose={() => setModalOpen(false)}
      />
    </SafeAreaView>
  );
}

interface MenuItemProps {
  bg: string;
  stroke: string;
  label: string;
  badge?: string;
  iconType: 'fridge' | 'today' | 'pop' | 'save';
  onPress: () => void;
}

function MenuItem({ bg, stroke, label, badge, iconType, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.mIcon, { backgroundColor: bg }]}>
        {iconType === 'fridge' && (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Rect x={5} y={3} width={14} height={18} rx={3} stroke={stroke} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M5 11h14" stroke={stroke} strokeWidth={1.7} strokeLinecap="round" />
            <Path d="M8.5 7v1.5M8.5 14.5v2" stroke={stroke} strokeWidth={1.7} strokeLinecap="round" />
          </Svg>
        )}
        {iconType === 'today' && (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M12 3a6 6 0 0 1 6 6c0 2.8-1.8 4.8-3.5 6.5V17h-5v-1.5C7.8 13.8 6 11.8 6 9a6 6 0 0 1 6-6z" stroke={stroke} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 20h6M10 17v3" stroke={stroke} strokeWidth={1.7} strokeLinecap="round" />
          </Svg>
        )}
        {iconType === 'pop' && (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M3 17l6-6 4 4 8-8" stroke={stroke} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M14 7h7v7" stroke={stroke} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
        {iconType === 'save' && (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={stroke} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
        {badge && (
          <View style={styles.mBadge}>
            <Text style={styles.mBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.mLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },

  // Topbar
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eggPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 100,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 12,
    position: 'relative',
    ...shadow.sm,
  },
  eggIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5D6',
  },
  candyCount: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  todayDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  shopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },

  // Character widget
  charWidget: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  charArtWrap: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFE29A',
    opacity: 0.4,
  },
  charTextArea: { flex: 1, minWidth: 0 },
  charGreet: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 20,
    marginBottom: 6,
  },
  charGreetAccent: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },
  charMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  charMetaText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  lvPill: {
    backgroundColor: colors.accentSoft,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  lvPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    color: colors.primary,
    letterSpacing: -0.1,
  },

  // Hero
  heroWrap: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
    ...shadow.cta,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    position: 'relative',
    minHeight: 156,
  },
  kicker: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
    marginBottom: 12,
  },
  kickerText: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    lineHeight: 28,
    marginBottom: 4,
  },
  heroTitleAccent: {
    color: '#FFF5D6',
  },
  heroDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: -0.1,
    marginBottom: 16,
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingLeft: 18,
    paddingRight: 16,
    borderRadius: 100,
  },
  heroCtaText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  heroCtaArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fridgeIllus: {
    position: 'absolute',
    right: 18,
    top: 14,
    opacity: 0.9,
  },

  // Menu grid
  menuGrid: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...shadow.sm,
  },
  menuItem: { alignItems: 'center', gap: 8, paddingVertical: 2 },
  mIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  mBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  mBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // Time section
  timeSection: { marginBottom: 10 },
  secHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  secHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.35,
  },
  timePill: {
    backgroundColor: colors.accentSoft,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 100,
    marginLeft: 4,
  },
  timePillText: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    color: colors.primary,
    letterSpacing: -0.1,
  },
  topBadge: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  topBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  emptyRec: {
    marginHorizontal: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyRecEmoji: { fontSize: 32, marginBottom: 8 },
  emptyRecTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  emptyRecDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: -0.1,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyRecBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  emptyRecBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
