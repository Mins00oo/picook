import React from 'react';
import Svg, {
  Ellipse,
  Path,
  Rect,
  Circle,
  Line,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
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
      <Defs>
        <RadialGradient id="rooSkin" cx="0.5" cy="0.35" rx="0.65" ry="0.7">
          <Stop offset="0" stopColor="#FCDDB8" />
          <Stop offset="1" stopColor="#E8B988" />
        </RadialGradient>
        <LinearGradient id="rooHair" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#E07835" />
          <Stop offset="1" stopColor="#A85020" />
        </LinearGradient>
        <RadialGradient id="rooBlush" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#FF7B68" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#FF7B68" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="rooShirt" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FF9655" />
          <Stop offset="1" stopColor="#F26F30" />
        </LinearGradient>
      </Defs>

      {/* 그림자 */}
      <Ellipse cx={50} cy={97} rx={22} ry={2.5} fill="rgba(31,22,18,0.18)" />

      {/* 다리 (짙은 회색) */}
      <Rect x={41} y={80} width={7} height={14} rx={3} fill="#5B5F6B" />
      <Rect x={52} y={80} width={7} height={14} rx={3} fill="#5B5F6B" />
      <Path d="M 44.5 81 L 44.5 93" stroke="#42454F" strokeWidth={0.4} opacity={0.6} />
      <Path d="M 55.5 81 L 55.5 93" stroke="#42454F" strokeWidth={0.4} opacity={0.6} />
      {/* 발 (흰 운동화) */}
      <Ellipse cx={44.5} cy={95} rx={7.5} ry={3.2} fill="#FFFFFF" stroke="#D9CFC2" strokeWidth={0.7} />
      <Ellipse cx={55.5} cy={95} rx={7.5} ry={3.2} fill="#FFFFFF" stroke="#D9CFC2" strokeWidth={0.7} />
      {/* 운동화 오렌지 굽 라인 */}
      <Line x1={37} y1={96.6} x2={52} y2={96.6} stroke="#FF6B4A" strokeWidth={0.9} />
      <Line x1={48} y1={96.6} x2={63} y2={96.6} stroke="#FF6B4A" strokeWidth={0.9} />
      {/* 운동화 끈 */}
      <Path d="M 41 93.5 L 48 94" stroke="#D9CFC2" strokeWidth={0.5} fill="none" />
      <Path d="M 52 94 L 59 93.5" stroke="#D9CFC2" strokeWidth={0.5} fill="none" />

      {/* 몸통 (오렌지 티) */}
      <Rect x={36} y={58} width={28} height={26} rx={7} fill="url(#rooShirt)" />
      {/* 흰 가로 줄무늬 */}
      <Line x1={37} y1={66} x2={63} y2={66} stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" opacity={0.92} />
      <Line x1={37} y1={72} x2={63} y2={72} stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" opacity={0.92} />
      <Line x1={37} y1={78} x2={63} y2={78} stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" opacity={0.92} />
      {/* 셔츠 음영 */}
      <Path d="M 36 78 Q 50 82 64 78" stroke="#C95A22" strokeWidth={0.5} fill="none" opacity={0.5} />

      {/* 목 */}
      <Path d="M 46 51 L 46 59 L 54 59 L 54 51 Z" fill="#E8B988" />
      <Path d="M 46 56 Q 50 58 54 56" stroke="#C49570" strokeWidth={0.4} fill="none" opacity={0.7} />

      {/* 포니테일 — 큰 곡선 + 곱슬 디테일 */}
      <Path
        d="M 70 18
           Q 86 14 86 30
           Q 88 42 78 44
           Q 73 38 71 30
           Q 69 24 70 18 Z"
        fill="url(#rooHair)"
      />
      {/* 포니테일 결 */}
      <Path d="M 75 22 Q 82 26 83 34" stroke="#7A3818" strokeWidth={0.6} fill="none" opacity={0.6} />
      <Path d="M 73 28 Q 78 32 80 38" stroke="#7A3818" strokeWidth={0.6} fill="none" opacity={0.5} />
      {/* 머리끈 */}
      <Rect x={69.5} y={19} width={5} height={3.2} rx={1.2} fill="#FF6B4A" />
      <Path d="M 70 21 L 74 21" stroke="#FFFFFF" strokeWidth={0.4} opacity={0.7} />

      {/* 머리 */}
      <Ellipse cx={50} cy={32} rx={22} ry={25} fill="url(#rooSkin)" />

      {/* 귀 */}
      <Ellipse cx={28.5} cy={34} rx={2.8} ry={4} fill="#E8B988" />
      <Ellipse cx={71.5} cy={34} rx={2.8} ry={4} fill="#E8B988" />
      <Ellipse cx={28.5} cy={35} rx={1.3} ry={2.2} fill="#C49570" opacity={0.6} />
      <Ellipse cx={71.5} cy={35} rx={1.3} ry={2.2} fill="#C49570" opacity={0.6} />

      {/* 머리카락 — 양옆 + 위 덮개 */}
      <Path
        d="M 28 28
           Q 25 8 38 5
           Q 50 1 62 5
           Q 75 8 72 28
           L 72 36
           Q 70 32 66 30
           L 60 28
           Q 50 30 40 28
           L 34 30
           Q 30 32 28 36 Z"
        fill="url(#rooHair)"
      />
      {/* 앞머리 사이드 스윕 */}
      <Path
        d="M 32 18
           Q 40 26 52 24
           Q 58 22 62 18
           L 60 14
           Q 50 10 38 14 Z"
        fill="url(#rooHair)"
      />
      {/* 앞머리 결 */}
      <Path d="M 38 14 Q 42 18 46 20" stroke="#7A3818" strokeWidth={0.6} fill="none" opacity={0.6} />
      <Path d="M 50 12 Q 52 16 54 20" stroke="#7A3818" strokeWidth={0.6} fill="none" opacity={0.5} />
      <Path d="M 60 14 Q 58 18 56 20" stroke="#7A3818" strokeWidth={0.5} fill="none" opacity={0.4} />
      {/* 정수리 하이라이트 */}
      <Ellipse cx={48} cy={9} rx={5.5} ry={1.5} fill="#FFB876" opacity={0.7} />
      {/* 앞머리 삐침 한두 가닥 */}
      <Path d="M 44 12 Q 45 7 47 9" stroke="#A85020" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Path d="M 56 11 Q 58 7 60 10" stroke="#A85020" strokeWidth={1.2} strokeLinecap="round" fill="none" />

      {/* 볼 (더 진함) */}
      <Ellipse cx={36} cy={43} rx={5} ry={3.4} fill="url(#rooBlush)" />
      <Ellipse cx={64} cy={43} rx={5} ry={3.4} fill="url(#rooBlush)" />

      {/* 코 점 */}
      <Ellipse cx={50} cy={40} rx={0.7} ry={0.9} fill="#C49570" opacity={0.7} />

      {/* 눈 — 반짝 큰 눈 */}
      <Ellipse cx={42} cy={37} rx={2.8} ry={3.4} fill="#1F1612" />
      <Ellipse cx={58} cy={37} rx={2.8} ry={3.4} fill="#1F1612" />
      {/* 큰 하이라이트 */}
      <Ellipse cx={42.9} cy={35.5} rx={1.4} ry={1.7} fill="#FFFFFF" />
      <Ellipse cx={58.9} cy={35.5} rx={1.4} ry={1.7} fill="#FFFFFF" />
      {/* 작은 반짝 */}
      <Circle cx={41.2} cy={38.4} r={0.6} fill="#FFFFFF" />
      <Circle cx={57.2} cy={38.4} r={0.6} fill="#FFFFFF" />
      {/* 속눈썹 (위·옆) */}
      <Path d="M 39.2 33.6 Q 38.4 32.5 37.6 32" stroke="#1F1612" strokeWidth={0.9} strokeLinecap="round" fill="none" />
      <Path d="M 44.4 33.6 Q 45 32.7 45.4 32.4" stroke="#1F1612" strokeWidth={0.7} strokeLinecap="round" fill="none" />
      <Path d="M 60.8 33.6 Q 61.6 32.5 62.4 32" stroke="#1F1612" strokeWidth={0.9} strokeLinecap="round" fill="none" />
      <Path d="M 55.6 33.6 Q 55 32.7 54.6 32.4" stroke="#1F1612" strokeWidth={0.7} strokeLinecap="round" fill="none" />
      {/* 눈꼬리 별 포인트 */}
      <Path
        d="M 67 32 L 67.5 33.4 L 69 33.7 L 67.5 34 L 67 35.4 L 66.5 34 L 65 33.7 L 66.5 33.4 Z"
        fill="#FFD66E"
      />

      {/* 입 — 활짝 웃음 */}
      <Path d="M 44 45 Q 50 50 56 45" stroke="#3A2418" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      {/* 이 힌트 */}
      <Path d="M 47 47 L 53 47" stroke="#FFFFFF" strokeWidth={1.3} strokeLinecap="round" />

      {/* 팔 (오렌지 소매) */}
      <Path d="M 36 64 Q 28 70 28 80" stroke="url(#rooShirt)" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={28} cy={81} r={4} fill="#E8B988" stroke="#C49570" strokeWidth={0.5} />
      <Path d="M 64 64 Q 72 70 72 80" stroke="url(#rooShirt)" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={72} cy={81} r={4} fill="#E8B988" stroke="#C49570" strokeWidth={0.5} />
    </Svg>
  );
}
