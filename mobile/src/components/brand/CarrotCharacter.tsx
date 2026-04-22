import React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';

interface Props {
  size?: number;
}

export function CarrotCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Leaves */}
      <Path d="M 32 14 Q 30 6 36 4 Q 40 8 40 14 Z" fill="#7BA95C" opacity={0.85} />
      <Path d="M 40 12 Q 40 4 44 4 Q 48 8 44 16 Z" fill="#8BC06C" opacity={0.85} />
      <Path d="M 44 14 Q 46 6 52 6 Q 54 12 48 18 Z" fill="#7BA95C" opacity={0.85} />
      {/* Body */}
      <Path
        d="M 22 26 Q 28 18 40 18 Q 52 18 58 26 Q 60 48 46 66 Q 40 72 34 66 Q 20 48 22 26 Z"
        fill="#F28C3C"
        stroke="#C4642A"
        strokeWidth={1.5}
        strokeOpacity={0.55}
      />
      <Path d="M 28 34 L 52 34" stroke="#C4642A" strokeWidth={0.8} opacity={0.5} />
      <Path d="M 30 46 L 50 46" stroke="#C4642A" strokeWidth={0.8} opacity={0.5} />
      <Path d="M 32 58 L 48 58" stroke="#C4642A" strokeWidth={0.8} opacity={0.5} />
      <Ellipse
        cx={32}
        cy={26}
        rx={6}
        ry={3}
        fill="#FFCC9A"
        opacity={0.7}
        transform="rotate(-20 32 26)"
      />
      <Ellipse cx={28} cy={44} rx={4} ry={2.5} fill="#FF9B85" opacity={0.5} />
      <Ellipse cx={52} cy={44} rx={4} ry={2.5} fill="#FF9B85" opacity={0.5} />
      <Path
        d="M 32 38 Q 34 35 36 38"
        stroke="#3A2418"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 44 38 Q 46 35 48 38"
        stroke="#3A2418"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 36 50 Q 40 54 44 50"
        stroke="#3A2418"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
