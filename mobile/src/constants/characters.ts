import type { CharacterType } from '../types/user';

export interface CharacterMeta {
  type: CharacterType;
  name: string; // 한글명 (예: "계란")
}

export const CHARACTERS: CharacterMeta[] = [
  { type: 'EGG', name: '계란' },
  { type: 'POTATO', name: '감자' },
  { type: 'CARROT', name: '당근' },
];

export function getCharacterName(type: CharacterType | undefined | null): string {
  if (!type) return '계란';
  return CHARACTERS.find((c) => c.type === type)?.name ?? '계란';
}
