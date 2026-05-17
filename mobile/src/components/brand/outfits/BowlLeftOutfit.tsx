import React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';

interface Props {
  size?: number;
}

// 믹싱볼 (leftHand). 왼손(cx28, cy81) 앞에 흰 그릇.
export function BowlLeftOutfit({ size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 그릇 본체 */}
      <Path
        d="M 19 78 Q 19 88 28 88 Q 37 88 37 78 Z"
        fill="#F4EFE5"
        stroke="#C4BCA8"
        strokeWidth={0.7}
      />
      {/* 그릇 상단 림 */}
      <Ellipse cx={28} cy={78} rx={9} ry={2.2} fill="#FFFFFF" stroke="#C4BCA8" strokeWidth={0.7} />
      {/* 그릇 안쪽 */}
      <Ellipse cx={28} cy={78.5} rx={7.6} ry={1.5} fill="#E5DED0" />
      {/* 좌측 하이라이트 */}
      <Path d="M 20.5 80 Q 20.5 85 23 87" stroke="#FFFFFF" strokeWidth={0.7} fill="none" opacity={0.8} />
      {/* 우측 음영 */}
      <Path d="M 35 82 Q 35 86 33 87.5" stroke="#C4BCA8" strokeWidth={0.5} fill="none" opacity={0.6} />
    </Svg>
  );
}
