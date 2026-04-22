import React from 'react';
import Svg, { Ellipse, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  /** 기본은 귀여운 계란(웃는 표정). 마이/내역 등 큰 사이즈에서 사용 */
  withFace?: boolean;
}

/**
 * 귀여운 계란 포인트 일러스트.
 * 하이라이트 + 볼터치 + (옵션) 살짝 웃는 눈/입.
 */
export function EggIcon({ size = 24, withFace = false }: Props) {
  const uid = `egg_${size}_${withFace ? 'f' : 'n'}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 48">
      <Defs>
        <RadialGradient id={`body_${uid}`} cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#FFF8E1" />
          <Stop offset="60%" stopColor="#FFE29A" />
          <Stop offset="100%" stopColor="#F4C94F" />
        </RadialGradient>
      </Defs>
      {/* body (egg shape) */}
      <Path
        d="M 20 4 Q 36 10 36 28 Q 36 44 20 44 Q 4 44 4 28 Q 4 10 20 4 Z"
        fill={`url(#body_${uid})`}
        stroke="#C4882E"
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      {/* top-left highlight */}
      <Ellipse cx={14} cy={14} rx={4} ry={2.5} fill="#FFF8E1" opacity={0.85} transform="rotate(-25 14 14)" />
      {withFace && (
        <>
          {/* cheeks */}
          <Ellipse cx={11} cy={30} rx={3.2} ry={2} fill="#FF9B85" opacity={0.5} />
          <Ellipse cx={29} cy={30} rx={3.2} ry={2} fill="#FF9B85" opacity={0.5} />
          {/* eyes */}
          <Path d="M 14 26 Q 16 24 18 26" stroke="#3A2418" strokeWidth={1.5} strokeLinecap="round" fill="none" />
          <Path d="M 22 26 Q 24 24 26 26" stroke="#3A2418" strokeWidth={1.5} strokeLinecap="round" fill="none" />
          {/* smile */}
          <Path d="M 17 34 Q 20 37 23 34" stroke="#3A2418" strokeWidth={1.3} strokeLinecap="round" fill="none" />
        </>
      )}
    </Svg>
  );
}
