import React from 'react';
import Svg, {
  Ellipse,
  Path,
  G,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';

interface CharacterProps {
  size?: number;
  /** 셋업 3카드형 캐릭터(모자 있음)는 false, 홈 위젯용 큰 캐릭터는 true */
  withHat?: boolean;
}

/**
 * 계란 캐릭터 — docs/ui-prototype/picook_symbol_onboarding_v1.0.html 의 c-art egg 와 매칭
 * 홈 위젯(withHat)은 picook_home_v1.0.html 의 char-art SVG 와 매칭
 */
export function EggCharacter({ size = 80, withHat = false }: CharacterProps) {
  const uid = `egg_${size}_${withHat ? 'h' : 'n'}`;
  if (withHat) {
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <RadialGradient id={`eggBody_${uid}`} cx="40%" cy="35%" r="70%">
            <Stop offset="0%" stopColor="#FFF8E1" />
            <Stop offset="60%" stopColor="#FFE9A8" />
            <Stop offset="100%" stopColor="#F4C94F" />
          </RadialGradient>
          <RadialGradient id={`eggShade_${uid}`} cx="70%" cy="75%" r="50%">
            <Stop offset="0%" stopColor="#E8A93C" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#E8A93C" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`cheek_${uid}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FF9B85" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#FF9B85" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={60} cy={64} rx={42} ry={48} fill={`url(#eggBody_${uid})`} />
        <Ellipse cx={60} cy={64} rx={42} ry={48} fill={`url(#eggShade_${uid})`} />
        <Ellipse
          cx={60}
          cy={64}
          rx={42}
          ry={48}
          fill="none"
          stroke="#C4882E"
          strokeWidth={1.8}
          strokeOpacity={0.55}
        />
        {/* Top highlight */}
        <Ellipse
          cx={45}
          cy={34}
          rx={10}
          ry={6}
          fill="#FFF8E1"
          opacity={0.85}
          transform="rotate(-25 45 34)"
        />
        {/* Chef hat */}
        <G transform="translate(60 22)">
          <Ellipse cx={0} cy={6} rx={16} ry={3.5} fill="#FFFFFF" stroke="#E8E0D0" strokeWidth={1} />
          <Path
            d="M -13 4 Q -16 -12 -6 -10 Q -3 -18 3 -14 Q 9 -18 12 -10 Q 17 -12 14 4 Z"
            fill="#FFFFFF"
            stroke="#E8E0D0"
            strokeWidth={1}
          />
        </G>
        {/* Cheeks */}
        <Ellipse cx={36} cy={72} rx={8} ry={5} fill={`url(#cheek_${uid})`} />
        <Ellipse cx={84} cy={72} rx={8} ry={5} fill={`url(#cheek_${uid})`} />
        {/* Eyes */}
        <Path
          d="M 42 64 Q 46 60 50 64"
          stroke="#3A2418"
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 70 64 Q 74 60 78 64"
          stroke="#3A2418"
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
        {/* Mouth */}
        <Path
          d="M 54 78 Q 60 84 66 78"
          stroke="#3A2418"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
        {/* Arms */}
        <Path
          d="M 22 74 Q 14 78 12 88"
          stroke="#C4882E"
          strokeWidth={2.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
        <Path
          d="M 98 74 Q 104 80 108 86"
          stroke="#C4882E"
          strokeWidth={2.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
      </Svg>
    );
  }

  // Setup card (80x80)
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse
        cx={40}
        cy={44}
        rx={28}
        ry={32}
        fill="#FFE29A"
        stroke="#C4882E"
        strokeWidth={1.5}
        strokeOpacity={0.55}
      />
      <Ellipse
        cx={32}
        cy={24}
        rx={6}
        ry={4}
        fill="#FFF8E1"
        opacity={0.85}
        transform="rotate(-25 32 24)"
      />
      {/* Hat */}
      <G transform="translate(40 14)">
        <Ellipse cx={0} cy={4} rx={11} ry={2.5} fill="#fff" stroke="#E8E0D0" strokeWidth={0.8} />
        <Path
          d="M -9 3 Q -11 -8 -4 -7 Q -2 -12 2 -9 Q 6 -12 8 -7 Q 11 -8 9 3 Z"
          fill="#fff"
          stroke="#E8E0D0"
          strokeWidth={0.8}
        />
      </G>
      <Ellipse cx={24} cy={50} rx={5} ry={3} fill="#FF9B85" opacity={0.6} />
      <Ellipse cx={56} cy={50} rx={5} ry={3} fill="#FF9B85" opacity={0.6} />
      <Path
        d="M 28 44 Q 31 41 34 44"
        stroke="#3A2418"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 46 44 Q 49 41 52 44"
        stroke="#3A2418"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 36 55 Q 40 60 44 55"
        stroke="#3A2418"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
