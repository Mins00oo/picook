import React from 'react';
import Svg, { Path, Rect, Circle, Line, Ellipse } from 'react-native-svg';

interface Props {
  size?: number;
}

// 흰 더블 브레스트 셰프 자켓 (top slot). 몸통 + 양 소매 덮음.
export function ChefJacketOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 자켓 몸통 */}
      <Rect x={35} y={58} width={30} height={26} rx={7} fill="#FFFFFF" stroke="#D9D2C4" strokeWidth={0.7} />
      {/* V 깃 */}
      <Path d="M 44 58 L 50 66 L 56 58 Z" fill="#F4EFE5" stroke="#D9D2C4" strokeWidth={0.6} />
      {/* 중앙 접힘 라인 */}
      <Line x1={50} y1={66} x2={50} y2={84} stroke="#D9D2C4" strokeWidth={0.5} opacity={0.6} />
      {/* 단추 좌측 3개 */}
      <Circle cx={44} cy={70} r={1.1} fill="#2A2A2A" />
      <Circle cx={44} cy={75} r={1.1} fill="#2A2A2A" />
      <Circle cx={44} cy={80} r={1.1} fill="#2A2A2A" />
      {/* 단추 우측 3개 */}
      <Circle cx={56} cy={70} r={1.1} fill="#2A2A2A" />
      <Circle cx={56} cy={75} r={1.1} fill="#2A2A2A" />
      <Circle cx={56} cy={80} r={1.1} fill="#2A2A2A" />
      {/* 자켓 하단 솔기 */}
      <Path d="M 36 82 Q 50 84 64 82" stroke="#D9D2C4" strokeWidth={0.5} fill="none" opacity={0.7} />
      {/* 좌측 소매 */}
      <Path d="M 36 64 Q 28 70 28 80" stroke="#FFFFFF" strokeWidth={6.5} strokeLinecap="round" fill="none" />
      <Path d="M 36 64 Q 28 70 28 80" stroke="#D9D2C4" strokeWidth={0.4} fill="none" opacity={0.5} />
      {/* 우측 소매 */}
      <Path d="M 64 64 Q 72 70 72 80" stroke="#FFFFFF" strokeWidth={6.5} strokeLinecap="round" fill="none" />
      <Path d="M 64 64 Q 72 70 72 80" stroke="#D9D2C4" strokeWidth={0.4} fill="none" opacity={0.5} />
      {/* 소매 끝 커프 */}
      <Ellipse cx={28} cy={79} rx={3.6} ry={1.4} fill="#FFFFFF" stroke="#D9D2C4" strokeWidth={0.5} />
      <Ellipse cx={72} cy={79} rx={3.6} ry={1.4} fill="#FFFFFF" stroke="#D9D2C4" strokeWidth={0.5} />
    </Svg>
  );
}
