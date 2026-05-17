import React from 'react';
import Svg, { Rect, Circle, Ellipse } from 'react-native-svg';

interface Props {
  size?: number;
}

// 검정 후라이팬 (rightHand). 오른손(cx72, cy81)이 손잡이를 잡고 팬이 우측 바깥으로.
export function FrypanRightOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 손잡이 */}
      <Rect x={73} y={80} width={6.5} height={2.2} rx={0.7} fill="#3A2A1F" stroke="#1F1612" strokeWidth={0.3} />
      <Circle cx={73.4} cy={81.1} r={1.1} fill="#5A4232" />
      {/* 팬 본체 외측 */}
      <Ellipse cx={86} cy={81} rx={7.2} ry={4} fill="#1A1A1A" stroke="#0A0A0A" strokeWidth={0.5} />
      {/* 팬 내부 (음영) */}
      <Ellipse cx={86} cy={80.6} rx={5.8} ry={3} fill="#2E2E2E" />
      {/* 팬 안쪽 하이라이트 */}
      <Ellipse cx={83.5} cy={79.6} rx={2.2} ry={0.7} fill="#5A5A5A" opacity={0.7} />
      {/* 팬 외측 하단 음영 */}
      <Ellipse cx={86} cy={83} rx={6} ry={0.8} fill="#0A0A0A" opacity={0.6} />
    </Svg>
  );
}
