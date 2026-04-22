import React from 'react';
import Svg, {
  Path,
  Ellipse,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface PotSymbolProps {
  size?: number;
}

/**
 * 프로토타입 Option 02 — Simmering Pot (김이 모락모락 냄비)
 * docs/ui-prototype/picook_symbol_onboarding_v1.0.html 와 1:1 매칭
 */
export function PotSymbol({ size = 100 }: PotSymbolProps) {
  const gradientId = `potGrad_${size}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FF7A5A" />
          <Stop offset="100%" stopColor="#C44A1C" />
        </LinearGradient>
      </Defs>
      {/* Steam */}
      <Path
        d="M 32 26 Q 28 16 36 10 Q 40 16 36 22 Q 32 28 36 34"
        stroke="#FF6B4A"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        opacity={0.55}
      />
      <Path
        d="M 50 22 Q 46 12 54 6 Q 58 12 54 18 Q 50 24 54 30"
        stroke="#FF6B4A"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
      <Path
        d="M 68 26 Q 64 16 72 10 Q 76 16 72 22 Q 68 28 72 34"
        stroke="#FF6B4A"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        opacity={0.55}
      />
      {/* Pot lid */}
      <Ellipse cx={50} cy={48} rx={36} ry={6} fill="#1F1612" />
      <Rect x={46} y={40} width={8} height={6} rx={2} fill="#1F1612" />
      {/* Pot body */}
      <Path
        d="M 18 52 Q 18 86 32 90 L 68 90 Q 82 86 82 52 Z"
        fill={`url(#${gradientId})`}
      />
      {/* Pot handles */}
      <Rect x={8} y={62} width={12} height={8} rx={3} fill="#1F1612" />
      <Rect x={80} y={62} width={12} height={8} rx={3} fill="#1F1612" />
      {/* Highlight */}
      <Path
        d="M 26 58 Q 26 78 34 84"
        stroke="#FFCAB6"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
    </Svg>
  );
}
