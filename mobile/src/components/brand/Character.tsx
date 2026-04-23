import React from 'react';
import { MinCharacter } from './MinCharacter';
import { RooCharacter } from './RooCharacter';
import { HaruCharacter } from './HaruCharacter';
import type { CharacterType } from '../../types/user';

interface CharacterProps {
  type: CharacterType;
  size?: number;
  /** @deprecated v2.0부터 모자는 CharacterOutfit의 head 슬롯으로 관리. 무시됨. */
  withHat?: boolean;
}

/**
 * Picook 캐릭터 디스패처 v2.1.
 * 세 명의 요리사(치비 2등신). 의상은 CharacterOutfit이 위에 겹침.
 * - MIN (민):  단정한 신입. 검은 보브컷 + 흰 티 + 베이지 바지.
 * - ROO (루):  열정 라이징. 포니테일 + 오렌지 줄무늬 티 + 흰 운동화.
 * - HARU (하루): 느긋 홈쿡. 버터 비니 + 졸린 눈 + 청바지.
 */
export function Character({ type, size = 80 }: CharacterProps) {
  switch (type) {
    case 'MIN':
      return <MinCharacter size={size} />;
    case 'ROO':
      return <RooCharacter size={size} />;
    case 'HARU':
      return <HaruCharacter size={size} />;
  }
}
