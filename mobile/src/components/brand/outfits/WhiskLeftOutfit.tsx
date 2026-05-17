import React from 'react';
import Svg, { Rect, Path, Line, Ellipse } from 'react-native-svg';

interface Props {
  size?: number;
}

// 거품기 (leftHand). 왼손(cx28, cy81) 위로 솟은 와이어 거품기.
export function WhiskLeftOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 손잡이 */}
      <Rect x={26.6} y={72} width={2.8} height={10} rx={1.4} fill="#9C9588" stroke="#6B6358" strokeWidth={0.4} />
      {/* 손잡이 그립 */}
      <Rect x={26.6} y={78} width={2.8} height={3.2} rx={0.3} fill="#5A5248" />
      {/* 와이어 헤드 외곽 */}
      <Path d="M 22 70 Q 28 56 34 70" stroke="#9C9588" strokeWidth={0.8} fill="none" />
      {/* 와이어 1 */}
      <Path d="M 23.5 70 Q 28 58 32.5 70" stroke="#C9C2B4" strokeWidth={0.7} fill="none" />
      {/* 와이어 2 */}
      <Path d="M 25 71 Q 28 60 31 71" stroke="#C9C2B4" strokeWidth={0.7} fill="none" />
      {/* 와이어 3 (가운데 세로) */}
      <Line x1={28} y1={58} x2={28} y2={71} stroke="#C9C2B4" strokeWidth={0.7} />
      {/* 상단 고리 */}
      <Ellipse cx={28} cy={58} rx={2} ry={1.2} fill="none" stroke="#9C9588" strokeWidth={0.8} />
      {/* 손잡이-와이어 연결부 */}
      <Ellipse cx={28} cy={71} rx={2.5} ry={0.8} fill="#9C9588" />
    </Svg>
  );
}
