import React from 'react';
import Svg, { Path, Rect, Ellipse, Line } from 'react-native-svg';

interface Props {
  size?: number;
}

// 흰 셰프 모자 (head slot). 머리(cx50/cy32/rx22/ry25) 위에 얹힘.
export function ChefHatOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 모자 윗부분 부풀린 형태 */}
      <Path
        d="M 30 18 Q 24 6 34 4 Q 38 -1 44 3 Q 50 -2 56 3 Q 62 -1 66 4 Q 76 6 70 18 Z"
        fill="#FFFFFF"
        stroke="#D9D2C4"
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
      {/* 둥근 융기 디테일 */}
      <Ellipse cx={36} cy={8} rx={5} ry={4} fill="#FFFFFF" />
      <Ellipse cx={50} cy={5} rx={6} ry={4.5} fill="#FFFFFF" />
      <Ellipse cx={64} cy={8} rx={5} ry={4} fill="#FFFFFF" />
      {/* 모자 밴드 */}
      <Rect x={28} y={17} width={44} height={7} rx={1.4} fill="#FFFFFF" stroke="#D9D2C4" strokeWidth={0.8} />
      {/* 밴드 하이라이트 */}
      <Rect x={29} y={18.5} width={42} height={1.2} fill="#F4EFE5" opacity={0.7} />
      {/* 밴드와 모자 경계 음영 */}
      <Line x1={28} y1={17} x2={72} y2={17} stroke="#C9C2B4" strokeWidth={0.4} opacity={0.5} />
    </Svg>
  );
}
