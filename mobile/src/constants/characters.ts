import type { CharacterType } from '../types/user';

export interface CharacterMeta {
  type: CharacterType;
  name: string;
  tagline: string;
}

export const CHARACTERS: CharacterMeta[] = [
  { type: 'MIN', name: '여자', tagline: '부드러운 베이스 캐릭터' },
  { type: 'ROO', name: '남자', tagline: '단정한 베이스 캐릭터' },
];

export function normalizeCharacterType(type: CharacterType | string | undefined | null): CharacterType {
  return type === 'ROO' ? 'ROO' : 'MIN';
}

export function getCharacterName(type: CharacterType | string | undefined | null): string {
  const normalized = normalizeCharacterType(type);
  return CHARACTERS.find((c) => c.type === normalized)?.name ?? CHARACTERS[0].name;
}

export function getCharacterTagline(type: CharacterType | string | undefined | null): string {
  const normalized = normalizeCharacterType(type);
  return CHARACTERS.find((c) => c.type === normalized)?.tagline ?? CHARACTERS[0].tagline;
}
