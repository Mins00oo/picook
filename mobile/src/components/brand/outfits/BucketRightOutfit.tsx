import React from 'react';
import Svg, { Path, Circle, Ellipse, Line } from 'react-native-svg';

interface Props {
  size?: number;
}

// 양동이 (rightHand). 오른손(cx72, cy81)이 손잡이를 위로 잡고 양동이가 아래로.
export function BucketRightOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 손잡이 (반원) */}
      <Path d="M 65 78 Q 72 70 79 78" stroke="#5A5A5A" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <Circle cx={65} cy={78.4} r={0.7} fill="#3A3A3A" />
      <Circle cx={79} cy={78.4} r={0.7} fill="#3A3A3A" />
      {/* 양동이 본체 (사다리꼴) */}
      <Path
        d="M 64 78.4 L 80 78.4 L 78.5 92 L 65.5 92 Z"
        fill="#C4C4C4"
        stroke="#7A7A7A"
        strokeWidth={0.7}
      />
      {/* 양동이 상단 림 */}
      <Ellipse cx={72} cy={78.4} rx={8} ry={1.5} fill="#D9D9D9" stroke="#7A7A7A" strokeWidth={0.7} />
      {/* 가로 줄무늬 */}
      <Line x1={65.2} y1={83} x2={78.8} y2={83} stroke="#7A7A7A" strokeWidth={0.4} opacity={0.7} />
      <Line x1={65.4} y1={87} x2={78.6} y2={87} stroke="#7A7A7A" strokeWidth={0.4} opacity={0.7} />
      {/* 좌측 하이라이트 */}
      <Line x1={66} y1={80} x2={66.5} y2={90} stroke="#FFFFFF" strokeWidth={0.4} opacity={0.6} />
    </Svg>
  );
}
