import React from 'react';
import Svg, {
  Ellipse,
  Path,
  Rect,
  Circle,
} from 'react-native-svg';

interface Props {
  size?: number;
}

/**
 * 민 (Min) — 단정한 신입 셰프.
 * 검은 보브컷 · 밝은 피부 · 흰 티 · 베이지 바지. 치비 2등신. viewBox 100×100.
 */
export function MinCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 그림자 */}
      <Ellipse cx={50} cy={97} rx={22} ry={2.5} fill="rgba(31,22,18,0.18)" />

      {/* 다리 (베이지 바지) */}
      <Rect x={41} y={80} width={7} height={14} rx={3} fill="#D9BC94" />
      <Rect x={52} y={80} width={7} height={14} rx={3} fill="#D9BC94" />
      {/* 발 (갈색 단화) */}
      <Ellipse cx={44.5} cy={95} rx={7.5} ry={3.2} fill="#6B4A2E" />
      <Ellipse cx={55.5} cy={95} rx={7.5} ry={3.2} fill="#6B4A2E" />

      {/* 몸통 (흰 티) */}
      <Rect x={36} y={58} width={28} height={26} rx={7} fill="#FFFFFF" stroke="#E8E0D0" strokeWidth={0.7} />
      {/* 네크라인 V 힌트 */}
      <Path d="M 47 58 Q 50 61 53 58" stroke="#E8E0D0" strokeWidth={0.7} fill="none" />

      {/* 목 (피부) */}
      <Rect x={46} y={51} width={8} height={8} fill="#FCE4D0" />

      {/* 머리 (피부 타원) */}
      <Ellipse cx={50} cy={32} rx={22} ry={25} fill="#FCE4D0" stroke="#C9A98A" strokeWidth={0.8} strokeOpacity={0.5} />

      {/* 귀 */}
      <Ellipse cx={28.5} cy={34} rx={2.8} ry={4} fill="#FCE4D0" stroke="#C9A98A" strokeWidth={0.6} strokeOpacity={0.5} />
      <Ellipse cx={71.5} cy={34} rx={2.8} ry={4} fill="#FCE4D0" stroke="#C9A98A" strokeWidth={0.6} strokeOpacity={0.5} />

      {/* 머리카락 — 보브컷 (검정) */}
      <Path
        d="M 28 24 Q 26 10 38 8 Q 50 4 62 8 Q 74 10 72 24 L 72 34 Q 70 30 66 28 L 60 26 L 40 26 L 34 28 Q 30 30 28 34 Z"
        fill="#2A1F1C"
      />
      {/* 앞머리 포인트 */}
      <Path d="M 40 18 Q 46 22 52 20 Q 58 22 60 18" stroke="#1A1210" strokeWidth={0.6} fill="none" opacity={0.4} />

      {/* 볼 */}
      <Ellipse cx={36} cy={40} rx={4} ry={2.5} fill="#FF9B85" opacity={0.6} />
      <Ellipse cx={64} cy={40} rx={4} ry={2.5} fill="#FF9B85" opacity={0.6} />

      {/* 눈 (동그란 점 + 하이라이트) */}
      <Circle cx={43} cy={35} r={1.7} fill="#1F1612" />
      <Circle cx={57} cy={35} r={1.7} fill="#1F1612" />
      <Circle cx={43.4} cy={34.5} r={0.55} fill="#FFFFFF" />
      <Circle cx={57.4} cy={34.5} r={0.55} fill="#FFFFFF" />

      {/* 입 (작은 미소) */}
      <Path d="M 46 43 Q 50 46 54 43" stroke="#3A2418" strokeWidth={1.6} strokeLinecap="round" fill="none" />

      {/* 팔 (흰 티 소매) */}
      <Path d="M 36 64 Q 28 70 28 80" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={28} cy={81} r={4} fill="#FCE4D0" stroke="#C9A98A" strokeWidth={0.6} />
      <Path d="M 64 64 Q 72 70 72 80" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={72} cy={81} r={4} fill="#FCE4D0" stroke="#C9A98A" strokeWidth={0.6} />
    </Svg>
  );
}
