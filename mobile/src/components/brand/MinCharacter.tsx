import React from 'react';
import Svg, {
  Ellipse,
  Path,
  Rect,
  Circle,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface Props {
  size?: number;
}

/**
 * 민 (Min) — 단정한 신입 셰프.
 * 검은 보브컷 · 큰 동그란 눈 · 흰 티 · 베이지 바지.
 * 옷 슬롯 좌표 호환 유지: viewBox 100×100, 머리 cx50/cy32/rx22/ry25, 몸통 x36-64/y58-84.
 */
export function MinCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="minSkin" cx="0.5" cy="0.35" rx="0.65" ry="0.7">
          <Stop offset="0" stopColor="#FDEBD8" />
          <Stop offset="1" stopColor="#F4C9A7" />
        </RadialGradient>
        <LinearGradient id="minHair" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#3A2A26" />
          <Stop offset="1" stopColor="#1A100E" />
        </LinearGradient>
        <RadialGradient id="minBlush" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#FF9B85" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#FF9B85" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="minShirt" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#F2EDE3" />
        </LinearGradient>
      </Defs>

      {/* 그림자 */}
      <Ellipse cx={50} cy={97} rx={22} ry={2.5} fill="rgba(31,22,18,0.18)" />

      {/* 다리 (베이지 바지) */}
      <Rect x={41} y={80} width={7} height={14} rx={3} fill="#DDC09A" />
      <Rect x={52} y={80} width={7} height={14} rx={3} fill="#DDC09A" />
      {/* 바지 솔기 */}
      <Path d="M 44.5 81 L 44.5 93" stroke="#C4A47C" strokeWidth={0.4} opacity={0.6} />
      <Path d="M 55.5 81 L 55.5 93" stroke="#C4A47C" strokeWidth={0.4} opacity={0.6} />
      {/* 발 (갈색 단화) */}
      <Ellipse cx={44.5} cy={95} rx={7.5} ry={3.2} fill="#6B4A2E" />
      <Ellipse cx={55.5} cy={95} rx={7.5} ry={3.2} fill="#6B4A2E" />
      {/* 단화 하이라이트 */}
      <Ellipse cx={44.5} cy={94} rx={5} ry={0.6} fill="#8B6A4E" opacity={0.6} />
      <Ellipse cx={55.5} cy={94} rx={5} ry={0.6} fill="#8B6A4E" opacity={0.6} />

      {/* 몸통 (흰 티) */}
      <Rect x={36} y={58} width={28} height={26} rx={7} fill="url(#minShirt)" stroke="#E0D5C2" strokeWidth={0.7} />
      {/* 네크라인 V */}
      <Path d="M 47 58 Q 50 62 53 58" stroke="#D9CBB6" strokeWidth={0.9} fill="none" />
      {/* 셔츠 음영 */}
      <Path d="M 36.5 78 Q 50 82 63.5 78" stroke="#E8DECB" strokeWidth={0.5} fill="none" opacity={0.7} />

      {/* 목 */}
      <Path d="M 46 51 L 46 59 L 54 59 L 54 51 Z" fill="#F4C9A7" />
      {/* 목 음영 */}
      <Path d="M 46 56 Q 50 58 54 56" stroke="#D9A887" strokeWidth={0.4} fill="none" opacity={0.7} />

      {/* 머리 */}
      <Ellipse cx={50} cy={32} rx={22} ry={25} fill="url(#minSkin)" />

      {/* 귀 */}
      <Ellipse cx={28.5} cy={34} rx={2.8} ry={4} fill="#F4C9A7" />
      <Ellipse cx={71.5} cy={34} rx={2.8} ry={4} fill="#F4C9A7" />
      {/* 귀 안쪽 */}
      <Ellipse cx={28.5} cy={35} rx={1.3} ry={2.2} fill="#E0A480" opacity={0.6} />
      <Ellipse cx={71.5} cy={35} rx={1.3} ry={2.2} fill="#E0A480" opacity={0.6} />

      {/* 머리카락 — 보브컷 본체 */}
      <Path
        d="M 28 30
           Q 25 7 40 5
           Q 50 2 60 5
           Q 75 7 72 30
           L 72 38
           Q 70 33 66 31
           L 60 29
           Q 58 32 50 32
           Q 42 32 40 29
           L 34 31
           Q 30 33 28 38 Z"
        fill="url(#minHair)"
      />
      {/* 앞머리 — 자연스러운 일자 */}
      <Path
        d="M 33 18
           Q 38 23 45 22
           Q 50 24 55 22
           Q 62 23 67 18
           L 68 30
           L 32 30 Z"
        fill="url(#minHair)"
      />
      {/* 머리카락 결 디테일 */}
      <Path d="M 36 13 Q 38 18 40 22" stroke="#1A0F0C" strokeWidth={0.5} fill="none" opacity={0.6} />
      <Path d="M 50 10 Q 50 18 50 22" stroke="#1A0F0C" strokeWidth={0.5} fill="none" opacity={0.5} />
      <Path d="M 64 13 Q 62 18 60 22" stroke="#1A0F0C" strokeWidth={0.5} fill="none" opacity={0.6} />
      {/* 정수리 하이라이트 */}
      <Ellipse cx={48} cy={9} rx={5.5} ry={1.5} fill="#5A3F38" opacity={0.7} />
      {/* 옆머리 끝 부드럽게 */}
      <Path d="M 27 30 Q 28 36 30 38" stroke="#1A0F0C" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M 73 30 Q 72 36 70 38" stroke="#1A0F0C" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.7} />

      {/* 볼 */}
      <Ellipse cx={36} cy={43} rx={4.8} ry={3.2} fill="url(#minBlush)" />
      <Ellipse cx={64} cy={43} rx={4.8} ry={3.2} fill="url(#minBlush)" />

      {/* 코 점 */}
      <Ellipse cx={50} cy={40} rx={0.7} ry={0.9} fill="#D9A887" opacity={0.65} />

      {/* 눈 — 큰 동그라미 */}
      <Ellipse cx={42} cy={37} rx={2.7} ry={3.3} fill="#1F1612" />
      <Ellipse cx={58} cy={37} rx={2.7} ry={3.3} fill="#1F1612" />
      {/* 눈 큰 하이라이트 */}
      <Ellipse cx={42.8} cy={35.6} rx={1.3} ry={1.5} fill="#FFFFFF" />
      <Ellipse cx={58.8} cy={35.6} rx={1.3} ry={1.5} fill="#FFFFFF" />
      {/* 눈 작은 하이라이트 */}
      <Circle cx={41.2} cy={38.2} r={0.55} fill="#FFFFFF" />
      <Circle cx={57.2} cy={38.2} r={0.55} fill="#FFFFFF" />
      {/* 속눈썹 */}
      <Path d="M 39.4 33.8 Q 38.6 32.8 38 32.2" stroke="#1F1612" strokeWidth={0.8} strokeLinecap="round" fill="none" />
      <Path d="M 60.6 33.8 Q 61.4 32.8 62 32.2" stroke="#1F1612" strokeWidth={0.8} strokeLinecap="round" fill="none" />

      {/* 입 — 작은 미소 */}
      <Path d="M 46.5 45.5 Q 50 48 53.5 45.5" stroke="#3A2418" strokeWidth={1.6} strokeLinecap="round" fill="none" />

      {/* 팔 (흰 티 소매) */}
      <Path d="M 36 64 Q 28 70 28 80" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M 36 64 Q 28 70 28 80" stroke="#E8DECB" strokeWidth={0.5} fill="none" opacity={0.5} />
      <Circle cx={28} cy={81} r={4} fill="#F4C9A7" stroke="#D9A887" strokeWidth={0.5} />
      <Path d="M 64 64 Q 72 70 72 80" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M 64 64 Q 72 70 72 80" stroke="#E8DECB" strokeWidth={0.5} fill="none" opacity={0.5} />
      <Circle cx={72} cy={81} r={4} fill="#F4C9A7" stroke="#D9A887" strokeWidth={0.5} />
    </Svg>
  );
}
