import React from 'react';
import Svg, { Ellipse, Path } from 'react-native-svg';

interface Props {
  size?: number;
}

// 검정 셰프 슈즈 (shoes slot). 발(cx44.5/55.5, cy95).
export function ChefShoesOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 왼쪽 신발 */}
      <Ellipse cx={44.5} cy={95} rx={7.5} ry={3.2} fill="#2A2A2A" />
      <Ellipse cx={44.5} cy={94} rx={5} ry={0.7} fill="#4A4A4A" opacity={0.6} />
      <Path d="M 42 95 Q 44.5 96 47 95" stroke="#1A1A1A" strokeWidth={0.4} fill="none" />
      {/* 오른쪽 신발 */}
      <Ellipse cx={55.5} cy={95} rx={7.5} ry={3.2} fill="#2A2A2A" />
      <Ellipse cx={55.5} cy={94} rx={5} ry={0.7} fill="#4A4A4A" opacity={0.6} />
      <Path d="M 53 95 Q 55.5 96 58 95" stroke="#1A1A1A" strokeWidth={0.4} fill="none" />
    </Svg>
  );
}
