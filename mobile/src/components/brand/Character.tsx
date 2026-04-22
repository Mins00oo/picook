import React from 'react';
import { EggCharacter } from './EggCharacter';
import { PotatoCharacter } from './PotatoCharacter';
import { CarrotCharacter } from './CarrotCharacter';
import type { CharacterType } from '../../types/user';

interface CharacterProps {
  type: CharacterType;
  size?: number;
  withHat?: boolean; // egg 전용 — 홈 위젯
}

export function Character({ type, size = 80, withHat = false }: CharacterProps) {
  switch (type) {
    case 'EGG':
      return <EggCharacter size={size} withHat={withHat} />;
    case 'POTATO':
      return <PotatoCharacter size={size} />;
    case 'CARROT':
      return <CarrotCharacter size={size} />;
  }
}
