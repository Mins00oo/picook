import React from 'react';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

interface Props {
  size?: number;
}

export function PotatoCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Path
        d="M 20 42 Q 16 22 32 16 Q 52 12 62 28 Q 68 48 54 62 Q 36 70 24 60 Q 14 52 20 42 Z"
        fill="#D4A47C"
        stroke="#8B6033"
        strokeWidth={1.5}
        strokeOpacity={0.55}
      />
      <Circle cx={32} cy={30} r={1.5} fill="#8B6033" opacity={0.5} />
      <Circle cx={48} cy={36} r={1.2} fill="#8B6033" opacity={0.5} />
      <Circle cx={38} cy={52} r={1.4} fill="#8B6033" opacity={0.5} />
      <Ellipse
        cx={30}
        cy={24}
        rx={6}
        ry={4}
        fill="#E8C9A5"
        opacity={0.6}
        transform="rotate(-20 30 24)"
      />
      <Ellipse cx={26} cy={50} rx={4} ry={2.5} fill="#FF9B85" opacity={0.5} />
      <Ellipse cx={54} cy={50} rx={4} ry={2.5} fill="#FF9B85" opacity={0.5} />
      <Path
        d="M 30 44 Q 33 41 36 44"
        stroke="#3A2418"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 46 44 Q 49 41 52 44"
        stroke="#3A2418"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 36 56 Q 40 60 44 56"
        stroke="#3A2418"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
