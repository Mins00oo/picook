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
 * 하루 (Haru) — 느긋한 홈쿡.
 * 버터 노랑 비니 · 반쯤 감은 졸린 눈 · 파스텔 블루 티 · 감색 청바지 · 남색 슬립온.
 */
export function HaruCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="haruSkin" cx="0.5" cy="0.4" rx="0.65" ry="0.7">
          <Stop offset="0" stopColor="#FCE2C5" />
          <Stop offset="1" stopColor="#E8C09A" />
        </RadialGradient>
        <LinearGradient id="haruBeanie" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FFE285" />
          <Stop offset="1" stopColor="#E8B838" />
        </LinearGradient>
        <RadialGradient id="haruBlush" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#FF9B85" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#FF9B85" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="haruShirt" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#C7E4EE" />
          <Stop offset="1" stopColor="#9FC8D8" />
        </LinearGradient>
        <LinearGradient id="haruJeans" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#4B5E80" />
          <Stop offset="1" stopColor="#2E3D58" />
        </LinearGradient>
      </Defs>

      {/* 그림자 */}
      <Ellipse cx={50} cy={97} rx={22} ry={2.5} fill="rgba(31,22,18,0.18)" />

      {/* 다리 (감색 청바지) */}
      <Rect x={41} y={80} width={7} height={14} rx={3} fill="url(#haruJeans)" />
      <Rect x={52} y={80} width={7} height={14} rx={3} fill="url(#haruJeans)" />
      {/* 청바지 솔기 */}
      <Path d="M 44.5 81 L 44.5 93" stroke="#6E80A2" strokeWidth={0.4} opacity={0.7} />
      <Path d="M 55.5 81 L 55.5 93" stroke="#6E80A2" strokeWidth={0.4} opacity={0.7} />
      {/* 발 (남색 슬립온) */}
      <Ellipse cx={44.5} cy={95} rx={7.5} ry={3.2} fill="#2E3A56" />
      <Ellipse cx={55.5} cy={95} rx={7.5} ry={3.2} fill="#2E3A56" />
      <Ellipse cx={44.5} cy={94} rx={5} ry={0.5} fill="#4B5C7E" opacity={0.6} />
      <Ellipse cx={55.5} cy={94} rx={5} ry={0.5} fill="#4B5C7E" opacity={0.6} />

      {/* 몸통 (파스텔 블루 티) */}
      <Rect x={36} y={58} width={28} height={26} rx={7} fill="url(#haruShirt)" stroke="#8FB8C8" strokeWidth={0.6} />
      {/* 가슴 포켓 */}
      <Rect x={55} y={63} width={5} height={5} rx={0.8} fill="none" stroke="#8FB8C8" strokeWidth={0.6} />
      {/* 셔츠 음영 */}
      <Path d="M 36 78 Q 50 81 64 78" stroke="#7FA8B8" strokeWidth={0.5} fill="none" opacity={0.5} />

      {/* 목 */}
      <Path d="M 46 51 L 46 59 L 54 59 L 54 51 Z" fill="#E8C09A" />
      <Path d="M 46 56 Q 50 58 54 56" stroke="#C49770" strokeWidth={0.4} fill="none" opacity={0.7} />

      {/* 머리 */}
      <Ellipse cx={50} cy={32} rx={22} ry={24} fill="url(#haruSkin)" />

      {/* 귀 */}
      <Ellipse cx={28.5} cy={34} rx={2.8} ry={4} fill="#E8C09A" />
      <Ellipse cx={71.5} cy={34} rx={2.8} ry={4} fill="#E8C09A" />
      <Ellipse cx={28.5} cy={35} rx={1.3} ry={2.2} fill="#C49770" opacity={0.6} />
      <Ellipse cx={71.5} cy={35} rx={1.3} ry={2.2} fill="#C49770" opacity={0.6} />

      {/* 비니 아래로 삐져나온 곱슬머리 */}
      <Path d="M 28 28 Q 30 32 33 32 Q 35 28 33 25" fill="#C97A30" stroke="#A35F1F" strokeWidth={0.4} />
      <Path d="M 72 28 Q 70 32 67 32 Q 65 28 67 25" fill="#C97A30" stroke="#A35F1F" strokeWidth={0.4} />
      <Path d="M 30 26 Q 32 30 34 31" stroke="#A35F1F" strokeWidth={0.5} fill="none" opacity={0.7} />
      <Path d="M 70 26 Q 68 30 66 31" stroke="#A35F1F" strokeWidth={0.5} fill="none" opacity={0.7} />

      {/* 비니 — 버터 노랑 */}
      <Path
        d="M 27 25
           Q 24 8 40 5
           Q 50 2 60 5
           Q 76 8 73 25
           Q 75 27 72 27
           L 28 27
           Q 25 27 27 25 Z"
        fill="url(#haruBeanie)"
        stroke="#C99A28"
        strokeWidth={0.6}
      />
      {/* 비니 니트 텍스처 — 가로 결 */}
      <Path d="M 30 12 Q 50 10 70 12" stroke="#C99A28" strokeWidth={0.5} fill="none" opacity={0.55} />
      <Path d="M 29 17 Q 50 15 71 17" stroke="#C99A28" strokeWidth={0.5} fill="none" opacity={0.55} />
      <Path d="M 28 22 Q 50 20 72 22" stroke="#C99A28" strokeWidth={0.5} fill="none" opacity={0.55} />
      {/* 비니 세로 결 */}
      <Path d="M 35 8 L 35 25" stroke="#D9A838" strokeWidth={0.4} opacity={0.4} />
      <Path d="M 50 6 L 50 25" stroke="#D9A838" strokeWidth={0.4} opacity={0.4} />
      <Path d="M 65 8 L 65 25" stroke="#D9A838" strokeWidth={0.4} opacity={0.4} />
      {/* 비니 밑단 접힘 */}
      <Rect x={27} y={23} width={46} height={4.5} rx={1.5} fill="#E8B838" opacity={0.65} />
      {/* 폼폼 */}
      <Circle cx={50} cy={4} r={3.5} fill="#FFEFB5" stroke="#C99A28" strokeWidth={0.6} />
      <Circle cx={49.5} cy={3.2} r={1.2} fill="#FFFAE0" opacity={0.8} />
      {/* 폼폼 결 */}
      <Path d="M 48 5 Q 50 3 52 5" stroke="#C99A28" strokeWidth={0.4} fill="none" opacity={0.6} />

      {/* 볼 */}
      <Ellipse cx={36} cy={43} rx={4.7} ry={3.2} fill="url(#haruBlush)" />
      <Ellipse cx={64} cy={43} rx={4.7} ry={3.2} fill="url(#haruBlush)" />

      {/* 코 점 */}
      <Ellipse cx={50} cy={40} rx={0.7} ry={0.9} fill="#C49770" opacity={0.7} />

      {/* 눈 — 반쯤 감은 졸린 호 */}
      <Path d="M 38 36 Q 42 40 46 36" stroke="#1F1612" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M 54 36 Q 58 40 62 36" stroke="#1F1612" strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* 속눈썹 두꺼운 마무리 */}
      <Path d="M 38 36 L 36.8 35" stroke="#1F1612" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Path d="M 62 36 L 63.2 35" stroke="#1F1612" strokeWidth={1.2} strokeLinecap="round" fill="none" />

      {/* 입 — 살짝 미소 */}
      <Path d="M 47 45.5 Q 50 47.5 53 45.5" stroke="#3A2418" strokeWidth={1.6} strokeLinecap="round" fill="none" />

      {/* 팔 (파스텔 블루 소매) */}
      <Path d="M 36 64 Q 28 70 28 80" stroke="url(#haruShirt)" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={28} cy={81} r={4} fill="#E8C09A" stroke="#C49770" strokeWidth={0.5} />
      <Path d="M 64 64 Q 72 70 72 80" stroke="url(#haruShirt)" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={72} cy={81} r={4} fill="#E8C09A" stroke="#C49770" strokeWidth={0.5} />
    </Svg>
  );
}
