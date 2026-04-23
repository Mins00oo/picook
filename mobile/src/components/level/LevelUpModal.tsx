import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, shadow } from '../../constants/theme';
import { CharacterOutfit, type EquippedOutfitImages } from '../brand/CharacterOutfit';
import { toAbsoluteImageUrl } from '../../utils/format';
import type { CharacterType } from '../../types/user';
import type { Outfit } from '../../types/outfit';

interface Props {
  visible: boolean;
  newLevel: number | null;
  grantedOutfits: Outfit[];
  characterType: CharacterType;
  equipped?: EquippedOutfitImages;
  onTryOn: () => void;
  onLater: () => void;
}

export function LevelUpModal({
  visible, newLevel, grantedOutfits, characterType, equipped,
  onTryOn, onLater,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onLater}>
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onLater} />
        <View style={styles.sheet}>
          <LinearGradient
            colors={['#FFE9D4', colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.top}
          >
            <View style={styles.charWrap}>
              <View style={styles.glow} />
              <CharacterOutfit
                characterType={characterType}
                equipped={equipped}
                size={110}
              />
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Lv.{newLevel}</Text>
              </View>
            </View>

            <View style={styles.kicker}>
              <Text style={styles.kickerText}>LEVEL UP</Text>
            </View>
            <Text style={styles.title}>
              <Text>축하해요!{'\n'}</Text>
              <Text style={styles.titleHl}>Lv.{newLevel}</Text>
              <Text>이 됐어요</Text>
            </Text>

            {grantedOutfits.length > 0 && (
              <Text style={styles.desc}>
                레벨업 보상으로{'\n'}
                <Text style={styles.descBold}>
                  {grantedOutfits.map((o) => o.name).join(' · ')}
                </Text>
                을(를) 받았어요
              </Text>
            )}
          </LinearGradient>

          {grantedOutfits.length > 0 && (
            <View style={styles.grantedRow}>
              {grantedOutfits.map((o) => {
                const uri = toAbsoluteImageUrl(o.imageUrl);
                return (
                  <View key={o.id} style={styles.grantedItem}>
                    {uri ? (
                      <Image source={{ uri }} style={styles.grantedImg} contentFit="contain" />
                    ) : (
                      <View style={styles.grantedImgPlaceholder}>
                        <Svg width={22} height={22} viewBox="0 0 24 24">
                          <Path d="M6 4h12l-2 16H8L6 4z" stroke={colors.primary} strokeWidth={1.8} strokeLinejoin="round" fill="none" />
                        </Svg>
                      </View>
                    )}
                    <Text style={styles.grantedName} numberOfLines={1}>{o.name}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.ghost} onPress={onLater} activeOpacity={0.85}>
              <Text style={styles.ghostText}>나중에</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primary} onPress={onTryOn} activeOpacity={0.85}>
              <Text style={styles.primaryText}>입어보기</Text>
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
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 18,
    alignItems: 'center',
  },
  charWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFE29A',
    opacity: 0.5,
  },
  levelBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 100,
    transform: [{ rotate: '8deg' }],
    ...shadow.md,
  },
  levelBadgeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: -0.2,
  },

  kicker: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: colors.accentSoft,
    marginTop: 12,
  },
  kickerText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    color: colors.primary,
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginTop: 10,
  },
  titleHl: { color: colors.primary },
  desc: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  descBold: { color: colors.textPrimary, fontFamily: fontFamily.bold },

  grantedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  grantedItem: {
    width: 64,
    alignItems: 'center',
    gap: 4,
  },
  grantedImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.lineSoft,
  },
  grantedImgPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grantedName: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    color: colors.textPrimary,
    letterSpacing: -0.1,
    textAlign: 'center',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 18,
    paddingTop: 8,
  },
  ghost: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  primary: {
    flex: 1.2,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.inkDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: '#fff',
    letterSpacing: -0.2,
  },
});
