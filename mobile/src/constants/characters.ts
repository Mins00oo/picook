import type { CharacterType } from '../types/user';

export interface CharacterMeta {
  type: CharacterType;
  name: string;        // 짧은 한글 이름 (셀렉터 라벨)
  tagline: string;     // 성격 한 줄
}

export const CHARACTERS: CharacterMeta[] = [
  { type: 'MIN',  name: '민',   tagline: '단정하고 꼼꼼한 신입 셰프' },
  { type: 'ROO',  name: '루',   tagline: '열정 넘치는 라이징 셰프' },
  { type: 'HARU', name: '하루', tagline: '느긋하고 편안한 홈쿡' },
];

export function getCharacterName(type: CharacterType | undefined | null): string {
  if (!type) return '민';
  return CHARACTERS.find((c) => c.type === type)?.name ?? '민';
}

export function getCharacterTagline(type: CharacterType | undefined | null): string {
  if (!type) return CHARACTERS[0].tagline;
  return CHARACTERS.find((c) => c.type === type)?.tagline ?? CHARACTERS[0].tagline;
}
