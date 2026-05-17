import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Character } from './Character';
import { getOutfitComponent } from './outfits';
import { normalizeCharacterType } from '../../constants/characters';
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
  const normalizedType = normalizeCharacterType(characterType);

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <Character type={normalizedType} size={size} />
      {LAYER_ORDER.map((slot) => {
        const item = equipped?.[slot];
        if (!item?.imageUrl) return null;

        // 1순위: SVG 컴포넌트 매핑이 있으면 그걸로 렌더 (캐릭터와 같은 viewBox 좌표계)
        const OutfitComp = getOutfitComponent(item.imageUrl);
        if (OutfitComp) {
          return (
            <View
              key={slot}
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { width: size, height: size }]}
            >
              <OutfitComp size={size} />
            </View>
          );
        }

        // 2순위: PNG fallback (디자이너가 업로드한 imageUrl).
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
