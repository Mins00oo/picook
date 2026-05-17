import React from 'react';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
}

// 팬케이크 더미 (leftHand). 왼손(cx28, cy81) 위에 접시 + 팬케이크 3겹 + 시럽 + 버터.
export function PancakesLeftOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 접시 */}
      <Ellipse cx={28} cy={85.5} rx={11} ry={2} fill="#FFFFFF" stroke="#C4BCA8" strokeWidth={0.6} />
      <Ellipse cx={28} cy={85} rx={9.5} ry={1.4} fill="#F4EFE5" />
      {/* 팬케이크 1 (하단) */}
      <Ellipse cx={28} cy={82.5} rx={9} ry={2.5} fill="#D9A862" stroke="#8B6638" strokeWidth={0.5} />
      <Path d="M 19 82.5 Q 28 84.5 37 82.5" stroke="#8B6638" strokeWidth={0.4} fill="none" opacity={0.5} />
      {/* 팬케이크 2 (중단) */}
      <Ellipse cx={28} cy={78.3} rx={9} ry={2.5} fill="#E8B872" stroke="#8B6638" strokeWidth={0.5} />
      <Path d="M 19 78.3 Q 28 80.3 37 78.3" stroke="#8B6638" strokeWidth={0.4} fill="none" opacity={0.5} />
      {/* 팬케이크 3 (상단) */}
      <Ellipse cx={28} cy={74.1} rx={9} ry={2.5} fill="#F4C880" stroke="#8B6638" strokeWidth={0.5} />
      {/* 시럽 흘러내림 */}
      <Path d="M 22 73 Q 23 76 22 80" stroke="#B86A1F" strokeWidth={1} fill="none" strokeLinecap="round" />
      <Path d="M 28 71.6 Q 28.5 76 28 82" stroke="#B86A1F" strokeWidth={1} fill="none" strokeLinecap="round" />
      <Path d="M 33 73 Q 33 76 34 80" stroke="#B86A1F" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* 버터 */}
      <Rect x={25.5} y={70.4} width={5} height={2} rx={0.4} fill="#FFE9A8" stroke="#D9B048" strokeWidth={0.4} />
      <Rect x={26} y={70.7} width={4} height={0.6} fill="#FFF4C8" opacity={0.8} />
    </Svg>
  );
}
