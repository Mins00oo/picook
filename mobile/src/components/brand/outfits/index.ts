import React from 'react';
import { ChefHatOutfit } from './ChefHatOutfit';
import { ChefJacketOutfit } from './ChefJacketOutfit';
import { ChefPantsOutfit } from './ChefPantsOutfit';
import { ChefShoesOutfit } from './ChefShoesOutfit';
import { WhiskLeftOutfit } from './WhiskLeftOutfit';
import { FrypanRightOutfit } from './FrypanRightOutfit';
import { BowlLeftOutfit } from './BowlLeftOutfit';
import { BucketRightOutfit } from './BucketRightOutfit';
import { PancakesLeftOutfit } from './PancakesLeftOutfit';

// outfit imageUrl basename → React 컴포넌트.
// 예: imageUrl="/outfits/chef_hat.png" → "chef_hat" 키로 매핑.
// 매핑 없으면 CharacterOutfit이 기존 <Image> 로 fallback.
export const OUTFIT_COMPONENT_MAP: Record<string, React.FC<{ size?: number }>> = {
  chef_hat: ChefHatOutfit,
  chef_jacket: ChefJacketOutfit,
  chef_pants: ChefPantsOutfit,
  chef_shoes: ChefShoesOutfit,
  whisk_left: WhiskLeftOutfit,
  frypan_right: FrypanRightOutfit,
  bowl_left: BowlLeftOutfit,
  bucket_right: BucketRightOutfit,
  pancakes_left: PancakesLeftOutfit,
};

/**
 * imageUrl에서 basename(확장자 제거)을 뽑아 등록된 SVG 컴포넌트를 반환.
 * 등록 안 됐으면 null → 호출자가 PNG fallback 로직 사용.
 *
 * 입력 예시:
 *   "/outfits/chef_hat.png" → "chef_hat" → ChefHatOutfit
 *   "/uploads/outfits/2026/05/13/uuid.png" → "uuid" → null (PNG fallback)
 */
export function getOutfitComponent(
  imageUrl: string | null | undefined,
): React.FC<{ size?: number }> | null {
  if (!imageUrl) return null;
  const match = imageUrl.match(/([^/\\]+)\.(svg|png|jpg|jpeg|webp)$/i);
  const key = match ? match[1] : imageUrl;
  return OUTFIT_COMPONENT_MAP[key] ?? null;
}
