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
  const weekSlots = buildWeekSlots(recentSevenDays);
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
              <Character type={characterType} size={110} />
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
              포인트를 모아서 캐릭터를 꾸며보세요
            </Text>
          </LinearGradient>

          {/* Streak row */}
          <View style={styles.streakBody}>
            <Text style={styles.streakLabel}>이번 주</Text>
            <View style={styles.streakRow}>
              {weekSlots.map(({ label, value, isToday }) => {
                const on = value === 1;
                return (
                  <View key={label} style={styles.streakSlot}>
                    <View
                      style={[
                        styles.streakStamp,
                        on && styles.streakStampOn,
                        isToday && !on && styles.streakStampTodayEmpty,
                      ]}
                    >
                      {on ? (
                        <Svg width={18} height={18} viewBox="0 0 24 24">
                          <Path
                            d="M5 12.5l4.2 4.2L19 7"
                            stroke="#fff"
                            strokeWidth={3.4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </Svg>
                      ) : (
                        <Text
                          style={[
                            styles.streakDayLabel,
                            isToday && styles.streakDayLabelToday,
                          ]}
                        >
                          {label}
                        </Text>
                      )}
                    </View>
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
                {isChecking ? '출석 중...' : '확인'}
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
  streakSlot: {
    flex: 1,
    alignItems: 'center',
  },
  streakDayLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  streakDayLabelToday: {
    color: colors.primary,
  },
  streakStamp: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakStampOn: {
    backgroundColor: colors.primary,
    transform: [{ rotate: '-8deg' }],
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  streakStampTodayEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
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

// 월~일 고정 순서로 출석 슬롯 빌드
// recentSevenDays: [6일전, ..., 오늘]
function buildWeekSlots(recentSevenDays: number[]): Array<{
  label: string;
  value: number;
  isToday: boolean;
}> {
  const labels = ['일', '월', '화', '수', '목', '금', '토'];
  const orderedDow = [1, 2, 3, 4, 5, 6, 0]; // 월~일
  const byDow = new Map<number, { value: number; isToday: boolean }>();
  const today = new Date();
  recentSevenDays.forEach((v, i) => {
    const offset = recentSevenDays.length - 1 - i;
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    byDow.set(d.getDay(), { value: v, isToday: offset === 0 });
  });
  return orderedDow.map((dow) => ({
    label: labels[dow],
    value: byDow.get(dow)?.value ?? 0,
    isToday: byDow.get(dow)?.isToday ?? false,
  }));
}
