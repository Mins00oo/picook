import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow, typography } from '../../constants/theme';
import { Character } from '../brand/Character';
import { EggIcon } from '../points/EggIcon';
import type { CharacterType } from '../../types/user';

interface Props {
  visible: boolean;
  characterType: CharacterType;
  streakDays: number;        // 확인 전 예상 연속일 (체크인 후엔 서버가 갱신)
  recentSevenDays: number[]; // [6일전, ..., 오늘]
  pointsToEarn?: number;
  isChecking: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DailyCheckModal({
  visible, characterType, streakDays, recentSevenDays, pointsToEarn = 10,
  isChecking, onConfirm, onClose,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />

        <View style={styles.sheet}>
          <LinearGradient
            colors={['#FFE9D4', colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.top}
          >
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={6}>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M6 6l12 12M6 18l12-12" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>

            {/* Character */}
            <View style={styles.charWrap}>
              <View style={styles.charGlow} />
              <Character type={characterType} size={110} withHat />
              {/* +10P bubble */}
              <View style={styles.pointBubble}>
                <EggIcon size={16} />
                <Text style={styles.pointText}>+{pointsToEarn}P</Text>
              </View>
            </View>

            <View style={styles.kicker}>
              <Text style={styles.kickerText}>
                {streakDays >= 1 ? `${streakDays}일 연속 출석` : '첫 출석!'}
              </Text>
            </View>
            <Text style={styles.title}>
              오늘도 <Text style={styles.titleAccent}>출석!</Text>
            </Text>
            <Text style={styles.desc}>
              매일 출석하고 계란 포인트를 모아보세요
            </Text>
          </LinearGradient>

          {/* Streak row */}
          <View style={styles.streakBody}>
            <Text style={styles.streakLabel}>이번 주 출석</Text>
            <View style={styles.streakRow}>
              {recentSevenDays.map((v, i) => {
                const isToday = i === recentSevenDays.length - 1;
                return (
                  <View
                    key={i}
                    style={[
                      styles.streakDot,
                      v === 1 && styles.streakDotOn,
                      isToday && v === 0 && styles.streakDotToday,
                    ]}
                  >
                    {v === 1 && (
                      <Svg width={9} height={9} viewBox="0 0 24 24">
                        <Path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" fill="none" />
                      </Svg>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* CTA */}
          <View style={styles.ctaWrap}>
            <TouchableOpacity
              style={styles.cta}
              onPress={onConfirm}
              disabled={isChecking}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>
                {isChecking ? '출석 중...' : `확인하고 +${pointsToEarn}P 받기`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,22,18,0.55)',
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    ...shadow.lg,
  },

  top: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  charWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  charGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFE29A',
    opacity: 0.45,
  },
  pointBubble: {
    position: 'absolute',
    top: -6,
    right: -16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 9,
    backgroundColor: colors.primary,
    borderRadius: 100,
    transform: [{ rotate: '8deg' }],
    ...shadow.md,
  },
  pointText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    color: '#fff',
    letterSpacing: -0.3,
  },

  kicker: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: colors.accentSoft,
    marginTop: 10,
  },
  kickerText: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  title: {
    ...typography.heroTitle,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: 10,
    textAlign: 'center',
  },
  titleAccent: { color: colors.primary },
  desc: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },

  streakBody: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  streakLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  streakDot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakDotOn: {
    backgroundColor: colors.primary,
  },
  streakDotToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  ctaWrap: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 4 },
  cta: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.inkDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: '#fff',
    letterSpacing: -0.3,
  },
});
