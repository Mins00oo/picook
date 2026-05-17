import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

interface Props {
  size?: number;
}

export function MinCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="minBaseSkin" cx="0.48" cy="0.3" rx="0.7" ry="0.75">
          <Stop offset="0" stopColor="#FFE7DD" />
          <Stop offset="1" stopColor="#F6B2A1" />
        </RadialGradient>
        <LinearGradient id="minBaseHair" x1="0.45" y1="0" x2="0.55" y2="1">
          <Stop offset="0" stopColor="#7A3D39" />
          <Stop offset="1" stopColor="#3B1D1C" />
        </LinearGradient>
        <RadialGradient id="minBaseBlush" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#FF8FA0" stopOpacity="0.78" />
          <Stop offset="1" stopColor="#FF8FA0" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="minBaseSuit" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FFF7F1" />
          <Stop offset="1" stopColor="#F7D9CC" />
        </LinearGradient>
      </Defs>

      <Ellipse cx={50} cy={96.4} rx={19.5} ry={2.9} fill="rgba(67,31,25,0.13)" />

      <Path
        d="M 64 28
           C 76 35 79 51 73 64
           C 69 72 60 72 58 64
           C 65 57 66 44 62 34 Z"
        fill="url(#minBaseHair)"
        stroke="#5A2823"
        strokeWidth={2.6}
        strokeLinejoin="round"
      />

      <Rect x={41.2} y={76.4} width={6.4} height={17.4} rx={2.7} fill="#F1D8CC" stroke="#5A2823" strokeWidth={1.9} />
      <Rect x={52.4} y={76.4} width={6.4} height={17.4} rx={2.7} fill="#F1D8CC" stroke="#5A2823" strokeWidth={1.9} />
      <Ellipse cx={44.2} cy={95.1} rx={6.5} ry={2.8} fill="#F8B7A6" stroke="#5A2823" strokeWidth={1.7} />
      <Ellipse cx={55.8} cy={95.1} rx={6.5} ry={2.8} fill="#F8B7A6" stroke="#5A2823" strokeWidth={1.7} />

      <Path d="M 37 64 C 32 68 29 74 29 80" stroke="#5A2823" strokeWidth={8.1} strokeLinecap="round" fill="none" />
      <Path d="M 37 64 C 32 68 29 74 29 80" stroke="url(#minBaseSkin)" strokeWidth={5.8} strokeLinecap="round" fill="none" />
      <Circle cx={29} cy={81} r={4.4} fill="url(#minBaseSkin)" stroke="#5A2823" strokeWidth={2} />

      <Path d="M 63 64 C 68 68 71 74 71 80" stroke="#5A2823" strokeWidth={8.1} strokeLinecap="round" fill="none" />
      <Path d="M 63 64 C 68 68 71 74 71 80" stroke="url(#minBaseSkin)" strokeWidth={5.8} strokeLinecap="round" fill="none" />
      <Circle cx={71} cy={81} r={4.4} fill="url(#minBaseSkin)" stroke="#5A2823" strokeWidth={2} />

      <Path
        d="M 34.8 63.2
           C 38.8 58.2 44.7 56 50 56
           C 55.3 56 61.2 58.2 65.2 63.2
           L 63.8 80.8
           C 57 84.1 43 84.1 36.2 80.8 Z"
        fill="url(#minBaseSuit)"
        stroke="#5A2823"
        strokeWidth={2.3}
        strokeLinejoin="round"
      />
      <Path d="M 44 60 C 46.5 63.4 53.5 63.4 56 60" stroke="#EAB4A5" strokeWidth={1.3} strokeLinecap="round" fill="none" />
      <Path d="M 38.4 74.6 C 44.5 76.2 55.5 76.2 61.6 74.6 L 61.2 80 C 55 82 45 82 38.8 80 Z" fill="#EBCFC3" opacity={0.9} />
      <Path d="M 40 79 C 45 81 55 81 60 79" stroke="#EBC6BB" strokeWidth={0.9} strokeLinecap="round" fill="none" />

      <Path d="M 45.3 50.8 L 45.3 59.2 C 48.1 61 51.9 61 54.7 59.2 L 54.7 50.8 Z" fill="#F1AA98" />

      <Ellipse cx={28.4} cy={36} rx={4.1} ry={5.2} fill="url(#minBaseSkin)" stroke="#5A2823" strokeWidth={1.8} />
      <Ellipse cx={71.6} cy={36} rx={4.1} ry={5.2} fill="url(#minBaseSkin)" stroke="#5A2823" strokeWidth={1.8} />
      <Ellipse cx={50} cy={34.5} rx={22.7} ry={25} fill="url(#minBaseSkin)" stroke="#5A2823" strokeWidth={2.6} />

      <Path
        d="M 27.2 29
           C 25 12.5 36.2 5.2 50 5.2
           C 63.8 5.2 75 12.5 72.8 29
           C 68.5 25.5 63.5 23.8 59.2 24.4
           C 56.6 31.6 50.8 32.7 47 25.6
           C 43 31.6 36.5 32.4 32.5 27.2
           C 30.5 29.2 28.8 30 27.2 29 Z"
        fill="url(#minBaseHair)"
        stroke="#5A2823"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M 31.5 24.5
           C 36.5 30.2 43.2 30.4 46.8 23.3
           C 49.8 29.7 55.4 30.5 58.2 23.8
           C 61.8 29.7 66.2 30.4 69.2 26
           L 68.5 33.4
           C 63.2 34.7 58.5 33.4 55.4 30
           C 51.2 34.2 44.8 34 40.2 29.8
           C 36.5 33.4 31.6 35 27.2 33.8
           L 27.2 29 Z"
        fill="url(#minBaseHair)"
      />
      <Path d="M 37.2 14 C 36.5 19.5 35.4 23.7 32.8 27.4" stroke="#A8635C" strokeWidth={1.15} strokeLinecap="round" fill="none" opacity={0.65} />
      <Path d="M 48.7 11.5 C 48 17.5 47.5 21.9 45.8 25.2" stroke="#A8635C" strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.58} />
      <Path d="M 61.6 15.2 C 60.2 20 59.4 23 58 25.8" stroke="#A8635C" strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.55} />
      <Path d="M 69.5 34 C 72 44 71 56 66 63" stroke="#2C1414" strokeWidth={1.1} strokeLinecap="round" fill="none" opacity={0.55} />
      <Ellipse cx={44} cy={10.3} rx={5} ry={1.6} fill="#C98B80" opacity={0.45} />

      <Ellipse cx={36.5} cy={44.1} rx={5.5} ry={3.6} fill="url(#minBaseBlush)" />
      <Ellipse cx={63.5} cy={44.1} rx={5.5} ry={3.6} fill="url(#minBaseBlush)" />

      <Ellipse cx={42} cy={37.5} rx={3.45} ry={4.2} fill="#3C1D1B" />
      <Ellipse cx={58} cy={37.5} rx={3.45} ry={4.2} fill="#3C1D1B" />
      <Ellipse cx={43.1} cy={35.8} rx={1.45} ry={1.65} fill="#FFFFFF" />
      <Ellipse cx={59.1} cy={35.8} rx={1.45} ry={1.65} fill="#FFFFFF" />
      <Circle cx={41.1} cy={39} r={0.58} fill="#FFFFFF" />
      <Circle cx={57.1} cy={39} r={0.58} fill="#FFFFFF" />
      <Path d="M 38.2 33.7 C 39.2 32.4 40.7 31.9 42.4 31.9" stroke="#3C1D1B" strokeWidth={1.1} strokeLinecap="round" fill="none" />
      <Path d="M 61.8 33.7 C 60.8 32.4 59.3 31.9 57.6 31.9" stroke="#3C1D1B" strokeWidth={1.1} strokeLinecap="round" fill="none" />
      <Path d="M 46.2 45.8 C 49 49 52 49 54.8 45.8" stroke="#5A2823" strokeWidth={1.9} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
