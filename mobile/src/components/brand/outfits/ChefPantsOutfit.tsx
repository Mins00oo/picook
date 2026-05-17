import React from 'react';
import Svg, { Rect, Line } from 'react-native-svg';

interface Props {
  size?: number;
}

// 파란 셰프 팬츠 (bottom slot). 다리(x41-48/52-59, y80-94)에 입혀짐.
export function ChefPantsOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 벨트 */}
      <Rect x={39} y={78.5} width={22} height={2.2} rx={0.6} fill="#2E4263" />
      {/* 벨트 버클 */}
      <Rect x={48.5} y={78.7} width={3} height={1.8} rx={0.3} fill="#D9D2C4" stroke="#9C9588" strokeWidth={0.3} />
      {/* 왼쪽 다리 */}
      <Rect x={41} y={80} width={7} height={14} rx={3} fill="#4A6FA5" />
      {/* 오른쪽 다리 */}
      <Rect x={52} y={80} width={7} height={14} rx={3} fill="#4A6FA5" />
      {/* 솔기 */}
      <Line x1={44.5} y1={81} x2={44.5} y2={93} stroke="#3A5A8B" strokeWidth={0.5} opacity={0.7} />
      <Line x1={55.5} y1={81} x2={55.5} y2={93} stroke="#3A5A8B" strokeWidth={0.5} opacity={0.7} />
      {/* 바지 끝단 음영 */}
      <Rect x={41} y={92.5} width={7} height={1.5} rx={0.5} fill="#3A5A8B" opacity={0.5} />
      <Rect x={52} y={92.5} width={7} height={1.5} rx={0.5} fill="#3A5A8B" opacity={0.5} />
    </Svg>
  );
}
