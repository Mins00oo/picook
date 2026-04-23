import React from 'react';
import Svg, {
  Ellipse,
  Path,
  Rect,
  Circle,
  Line,
} from 'react-native-svg';

interface Props {
  size?: number;
}

/**
 * 루 (Roo) — 열정 라이징 셰프.
 * 주황 포니테일 · 반짝 눈 · 오렌지 줄무늬 티 · 짙은 회색 바지 · 흰 운동화.
 */
export function RooCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx={50} cy={97} rx={22} ry={2.5} fill="rgba(31,22,18,0.18)" />

      {/* 다리 (짙은 회색) */}
      <Rect x={41} y={80} width={7} height={14} rx={3} fill="#5B5F6B" />
      <Rect x={52} y={80} width={7} height={14} rx={3} fill="#5B5F6B" />
      {/* 발 (흰 운동화) */}
      <Ellipse cx={44.5} cy={95} rx={7.5} ry={3.2} fill="#FFFFFF" stroke="#D9CFC2" strokeWidth={0.7} />
      <Ellipse cx={55.5} cy={95} rx={7.5} ry={3.2} fill="#FFFFFF" stroke="#D9CFC2" strokeWidth={0.7} />
      {/* 운동화 굽 라인 */}
      <Line x1={37} y1={96.5} x2={52} y2={96.5} stroke="#FF6B4A" strokeWidth={0.8} />
      <Line x1={48} y1={96.5} x2={63} y2={96.5} stroke="#FF6B4A" strokeWidth={0.8} />

      {/* 몸통 (오렌지 티) */}
      <Rect x={36} y={58} width={28} height={26} rx={7} fill="#FF8847" />
      {/* 흰 가로 줄무늬 */}
      <Line x1={36} y1={66} x2={64} y2={66} stroke="#FFFFFF" strokeWidth={1.6} />
      <Line x1={36} y1={72} x2={64} y2={72} stroke="#FFFFFF" strokeWidth={1.6} />
      <Line x1={36} y1={78} x2={64} y2={78} stroke="#FFFFFF" strokeWidth={1.6} />

      {/* 목 */}
      <Rect x={46} y={51} width={8} height={8} fill="#E8C9A5" />

      {/* 포니테일 (오른쪽 뒤로 삐침) */}
      <Path
        d="M 70 22 Q 82 18 84 30 Q 86 40 78 42 Q 74 36 72 28 Z"
        fill="#C4642A"
      />
      {/* 머리끈 */}
      <Rect x={70} y={21} width={4.5} height={2.8} rx={1} fill="#FF6B4A" />

      {/* 머리 */}
      <Ellipse cx={50} cy={32} rx={22} ry={25} fill="#E8C9A5" stroke="#A87E58" strokeWidth={0.8} strokeOpacity={0.5} />

      {/* 귀 */}
      <Ellipse cx={28.5} cy={34} rx={2.8} ry={4} fill="#E8C9A5" stroke="#A87E58" strokeWidth={0.6} strokeOpacity={0.5} />
      <Ellipse cx={71.5} cy={34} rx={2.8} ry={4} fill="#E8C9A5" stroke="#A87E58" strokeWidth={0.6} strokeOpacity={0.5} />

      {/* 머리카락 (주황 갈색 — 양옆 덮개) */}
      <Path
        d="M 28 22 Q 28 10 38 6 Q 50 2 62 6 Q 72 10 72 22 L 72 32 Q 70 28 66 26 L 60 24 L 40 24 L 34 26 Q 30 28 28 32 Z"
        fill="#C4642A"
      />
      {/* 앞머리 삐침 */}
      <Path d="M 42 18 Q 44 12 46 16" stroke="#8B4513" strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <Path d="M 55 16 Q 58 12 60 16" stroke="#8B4513" strokeWidth={1.4} strokeLinecap="round" fill="none" />

      {/* 볼 (더 진함) */}
      <Ellipse cx={36} cy={40} rx={4.5} ry={3} fill="#FF9B85" opacity={0.75} />
      <Ellipse cx={64} cy={40} rx={4.5} ry={3} fill="#FF9B85" opacity={0.75} />

      {/* 눈 (반짝) */}
      <Circle cx={43} cy={35} r={2.1} fill="#1F1612" />
      <Circle cx={57} cy={35} r={2.1} fill="#1F1612" />
      <Circle cx={43.6} cy={34.3} r={0.8} fill="#FFFFFF" />
      <Circle cx={57.6} cy={34.3} r={0.8} fill="#FFFFFF" />

      {/* 눈꼬리 별 포인트 */}
      <Path
        d="M 65 31 L 65.5 32.3 L 67 32.6 L 65.5 33 L 65 34.3 L 64.5 33 L 63 32.6 L 64.5 32.3 Z"
        fill="#FFD66E"
      />

      {/* 입 (활짝 웃음) */}
      <Path d="M 44 43 Q 50 48 56 43" stroke="#3A2418" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      {/* 이 힌트 */}
      <Path d="M 47 45 L 53 45" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

      {/* 팔 (오렌지 소매) */}
      <Path d="M 36 64 Q 28 70 28 80" stroke="#FF8847" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={28} cy={81} r={4} fill="#E8C9A5" stroke="#A87E58" strokeWidth={0.6} />
      <Path d="M 64 64 Q 72 70 72 80" stroke="#FF8847" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={72} cy={81} r={4} fill="#E8C9A5" stroke="#A87E58" strokeWidth={0.6} />
    </Svg>
  );
}
