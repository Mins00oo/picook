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
 * 하루 (Haru) — 느긋한 홈쿡.
 * 버터 노랑 비니 · 반감은 졸린 눈 · 파스텔 블루 티 · 감색 청바지 · 남색 슬립온.
 */
export function HaruCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx={50} cy={97} rx={22} ry={2.5} fill="rgba(31,22,18,0.18)" />

      {/* 다리 (감색 청바지) */}
      <Rect x={41} y={80} width={7} height={14} rx={3} fill="#3A4A6A" />
      <Rect x={52} y={80} width={7} height={14} rx={3} fill="#3A4A6A" />
      {/* 청바지 솔기 */}
      <Line x1={44.5} y1={80} x2={44.5} y2={94} stroke="#5A6A8A" strokeWidth={0.5} />
      <Line x1={55.5} y1={80} x2={55.5} y2={94} stroke="#5A6A8A" strokeWidth={0.5} />
      {/* 발 (남색 슬립온) */}
      <Ellipse cx={44.5} cy={95} rx={7.5} ry={3.2} fill="#2E3A56" />
      <Ellipse cx={55.5} cy={95} rx={7.5} ry={3.2} fill="#2E3A56" />

      {/* 몸통 (파스텔 블루 티) */}
      <Rect x={36} y={58} width={28} height={26} rx={7} fill="#BBDCE8" stroke="#A4C8D6" strokeWidth={0.7} />
      {/* 작은 가슴 포켓 */}
      <Rect x={55} y={63} width={5} height={5} rx={0.8} fill="none" stroke="#A4C8D6" strokeWidth={0.6} />

      {/* 목 */}
      <Rect x={46} y={51} width={8} height={8} fill="#EBC9A5" />

      {/* 머리 */}
      <Ellipse cx={50} cy={32} rx={22} ry={24} fill="#EBC9A5" stroke="#B8956E" strokeWidth={0.8} strokeOpacity={0.5} />

      {/* 귀 */}
      <Ellipse cx={28.5} cy={34} rx={2.8} ry={4} fill="#EBC9A5" stroke="#B8956E" strokeWidth={0.6} strokeOpacity={0.5} />
      <Ellipse cx={71.5} cy={34} rx={2.8} ry={4} fill="#EBC9A5" stroke="#B8956E" strokeWidth={0.6} strokeOpacity={0.5} />

      {/* 비니 아래 짧은 머리 삐침 (귀 옆) */}
      <Path d="M 28 27 Q 30 32 34 32" stroke="#C47840" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <Path d="M 72 27 Q 70 32 66 32" stroke="#C47840" strokeWidth={2.2} strokeLinecap="round" fill="none" />

      {/* 비니 (버터 노랑) */}
      <Path
        d="M 28 24 Q 26 10 40 6 Q 50 4 60 6 Q 74 10 72 24 Q 74 26 72 26 L 28 26 Q 26 26 28 24 Z"
        fill="#FFD66E"
        stroke="#D9B048"
        strokeWidth={0.8}
      />
      {/* 비니 니트 텍스처 (가로 선) */}
      <Path d="M 30 15 L 70 15" stroke="#D9B048" strokeWidth={0.5} opacity={0.55} />
      <Path d="M 29 21 L 71 21" stroke="#D9B048" strokeWidth={0.5} opacity={0.55} />
      {/* 비니 밑단 접힘 */}
      <Rect x={28} y={23} width={44} height={4} rx={1} fill="#E8BD55" opacity={0.5} />
      {/* 비니 pompom */}
      <Circle cx={50} cy={5} r={3.2} fill="#FFE9A8" stroke="#D9B048" strokeWidth={0.6} />

      {/* 볼 */}
      <Ellipse cx={36} cy={40} rx={4} ry={2.5} fill="#FF9B85" opacity={0.6} />
      <Ellipse cx={64} cy={40} rx={4} ry={2.5} fill="#FF9B85" opacity={0.6} />

      {/* 눈 (반감은 졸린 호) */}
      <Path d="M 40 35 Q 43 38 46 35" stroke="#1F1612" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M 54 35 Q 57 38 60 35" stroke="#1F1612" strokeWidth={1.8} strokeLinecap="round" fill="none" />

      {/* 입 (살짝 미소) */}
      <Path d="M 47 43 Q 50 45 53 43" stroke="#3A2418" strokeWidth={1.6} strokeLinecap="round" fill="none" />

      {/* 팔 (파스텔 블루 소매) */}
      <Path d="M 36 64 Q 28 70 28 80" stroke="#BBDCE8" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={28} cy={81} r={4} fill="#EBC9A5" stroke="#B8956E" strokeWidth={0.6} />
      <Path d="M 64 64 Q 72 70 72 80" stroke="#BBDCE8" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={72} cy={81} r={4} fill="#EBC9A5" stroke="#B8956E" strokeWidth={0.6} />
    </Svg>
  );
}
