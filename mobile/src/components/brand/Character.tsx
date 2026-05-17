import React from 'react';
import { MinCharacter } from './MinCharacter';
import { RooCharacter } from './RooCharacter';
import type { CharacterType } from '../../types/user';

interface CharacterProps {
  type: CharacterType;
  size?: number;
  /** @deprecated Hats are rendered through CharacterOutfit head layers. */
  withHat?: boolean;
}

export function Character({ type, size = 80 }: CharacterProps) {
  if (type === 'ROO') {
    return <RooCharacter size={size} />;
  }

  return <MinCharacter size={size} />;
}
