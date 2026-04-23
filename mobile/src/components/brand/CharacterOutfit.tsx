import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Character } from './Character';
import type { CharacterType } from '../../types/user';
import type { OutfitSlot } from '../../types/outfit';
import { toAbsoluteImageUrl } from '../../utils/format';

// CharacterOutfit 렌더 전용 — slot → 이미지 URL 직접 매핑.
// API의 EquippedSlotMap(slot → outfitId)은 호출자가 outfits.lookup 후 이 타입으로 변환.
export type EquippedOutfitImages = Partial<Record<OutfitSlot, { imageUrl: string } | null>>;

interface Props {
  characterType: CharacterType;
  equipped?: EquippedOutfitImages;
  size?: number;
}

// 레이어 순서 (바닥 → 위):
// body(Character) → bottom → top → shoes → head → leftHand/rightHand
const LAYER_ORDER: OutfitSlot[] = ['bottom', 'top', 'shoes', 'head', 'leftHand', 'rightHand'];

export function CharacterOutfit({ characterType, equipped, size = 110 }: Props) {
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <Character type={characterType} size={size} />
      {LAYER_ORDER.map((slot) => {
        const item = equipped?.[slot];
        if (!item?.imageUrl) return null;
        const uri = toAbsoluteImageUrl(item.imageUrl);
        if (!uri) return null;
        return (
          <Image
            key={slot}
            source={{ uri }}
            style={[StyleSheet.absoluteFill, { width: size, height: size }]}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
});
