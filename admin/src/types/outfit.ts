export type OutfitSlot = 'head' | 'top' | 'bottom' | 'shoes' | 'leftHand' | 'rightHand';

export interface AdminOutfit {
  id: number;
  slot: OutfitSlot;
  name: string;
  description?: string;
  imageUrl: string;
  pricePoints: number;
  unlockLevel?: number | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  owned?: boolean | null;
  equipped?: boolean | null;
}

export interface AdminOutfitRequest {
  slot: OutfitSlot;
  name: string;
  description?: string;
  imageUrl: string;
  pricePoints: number;
  unlockLevel?: number | null;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}
