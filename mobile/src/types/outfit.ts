export type OutfitSlot =
  | 'head'
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'leftHand'
  | 'rightHand';

export const OUTFIT_SLOTS: OutfitSlot[] = [
  'head',
  'top',
  'bottom',
  'shoes',
  'leftHand',
  'rightHand',
];

export const SLOT_LABEL: Record<OutfitSlot, string> = {
  head: '모자',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  leftHand: '왼손',
  rightHand: '오른손',
};

export type OutfitAcquiredSource = 'SHOP' | 'LEVEL_REWARD' | 'DEFAULT';

export interface Outfit {
  id: number;
  slot: OutfitSlot;
  name: string;
  description: string | null;
  imageUrl: string;
  pricePoints: number;
  unlockLevel: number | null; // null=상점 판매, 숫자=레벨 보상 전용
  isDefault: boolean;
  sortOrder: number;
}

export interface UserOutfitInventoryItem {
  outfitId: number;
  acquiredSource: OutfitAcquiredSource;
  acquiredAt: string;
}

// slot → outfitId(null이면 해제)
export type EquippedSlotMap = Partial<Record<OutfitSlot, number | null>>;

export interface OutfitMeResponse {
  owned: UserOutfitInventoryItem[];
  equipped: EquippedSlotMap;
}

// 레벨 보상 응답 (요리 완료/출석 공통)
export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  grantedOutfits: Outfit[];
}
