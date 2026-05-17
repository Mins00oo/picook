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

export function RooCharacter({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="rooSkin" cx="0.45" cy="0.24" rx="0.76" ry="0.78">
          <Stop offset="0" stopColor="#FFE2C9" />
          <Stop offset="1" stopColor="#F3A77F" />
        </RadialGradient>
        <LinearGradient id="rooHair" x1="0.4" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor="#C46D39" />
          <Stop offset="0.58" stopColor="#A94F27" />
          <Stop offset="1" stopColor="#743019" />
        </LinearGradient>
        <LinearGradient id="rooShirt" x1="0.48" y1="0" x2="0.52" y2="1">
          <Stop offset="0" stopColor="#FFFBE9" />
          <Stop offset="1" stopColor="#F0E2B6" />
        </LinearGradient>
        <LinearGradient id="rooPants" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#9B5B4F" />
          <Stop offset="1" stopColor="#6D2E2F" />
        </LinearGradient>
        <RadialGradient id="rooBlush" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#FF8B6F" stopOpacity="0.68" />
          <Stop offset="1" stopColor="#FF8B6F" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Ellipse cx={50} cy={96} rx={19} ry={2.8} fill="rgba(71,34,25,0.15)" />

      <Rect x={40.4} y={76.2} width={7.2} height={17.4} rx={3.1} fill="url(#rooPants)" stroke="#5B2A22" strokeWidth={2} />
      <Rect x={52.4} y={76.2} width={7.2} height={17.4} rx={3.1} fill="url(#rooPants)" stroke="#5B2A22" strokeWidth={2} />
      <Ellipse cx={44} cy={95} rx={7} ry={3} fill="#2F6EFF" stroke="#5B2A22" strokeWidth={1.8} />
      <Ellipse cx={56} cy={95} rx={7} ry={3} fill="#2F6EFF" stroke="#5B2A22" strokeWidth={1.8} />
      <Path d="M 38.2 95.5 C 41.2 97 46.8 97 49.8 95.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Path d="M 50.2 95.5 C 53.2 97 58.8 97 61.8 95.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" fill="none" />

      <Path d="M 38 63 C 33.5 67 30 74 29 80" stroke="#5B2A22" strokeWidth={7.8} strokeLinecap="round" fill="none" />
      <Path d="M 38 63 C 33.5 67 30 74 29 80" stroke="url(#rooSkin)" strokeWidth={5.5} strokeLinecap="round" fill="none" />
      <Circle cx={28.8} cy={81} r={4.4} fill="url(#rooSkin)" stroke="#5B2A22" strokeWidth={2} />

      <Path d="M 62 63 C 66.5 67 70 74 71 80" stroke="#5B2A22" strokeWidth={7.8} strokeLinecap="round" fill="none" />
      <Path d="M 62 63 C 66.5 67 70 74 71 80" stroke="url(#rooSkin)" strokeWidth={5.5} strokeLinecap="round" fill="none" />
      <Circle cx={71.2} cy={81} r={4.4} fill="url(#rooSkin)" stroke="#5B2A22" strokeWidth={2} />

      <Path d="M 34.8 62.8 C 38.9 57.9 45.3 55.7 50 55.7 C 54.7 55.7 61.1 57.9 65.2 62.8 L 64 76.5 C 57.1 80.4 42.9 80.4 36 76.5 Z"
        fill="url(#rooShirt)" stroke="#5B2A22" strokeWidth={2.3} strokeLinejoin="round" />
      <Path d="M 42.5 61 C 45.2 63.3 54.8 63.3 57.5 61" stroke="#E4D6A9" strokeWidth={1.1} strokeLinecap="round" fill="none" />
      <Path d="M 39.5 75.3 C 45.5 77.2 54.5 77.2 60.5 75.3" stroke="#D7C590" strokeWidth={0.9} strokeLinecap="round" fill="none" opacity={0.9} />

      <Path d="M 45.3 50.5 L 45.3 58.2 C 48 59.8 52 59.8 54.7 58.2 L 54.7 50.5 Z" fill="#EFA076" />

      <Ellipse cx={26.8} cy={37} rx={4.1} ry={5.9} fill="url(#rooSkin)" stroke="#5B2A22" strokeWidth={1.8} />
      <Ellipse cx={73.2} cy={37} rx={4.1} ry={5.9} fill="url(#rooSkin)" stroke="#5B2A22" strokeWidth={1.8} />
      <Ellipse cx={50} cy={34.5} rx={23.5} ry={26.7} fill="url(#rooSkin)" stroke="#5B2A22" strokeWidth={2.6} />

      <Path
        d="M 26.2 31
           C 24.8 15.5 36.8 5.4 50.2 5.4
           C 63.5 5.4 75.4 15.5 73.8 31.5
           C 68.8 28.5 63 27 57.4 27.6
           C 53 29.5 46.2 29.3 41.3 27.2
           C 35.3 26.2 29.8 27.4 26.2 31 Z"
        fill="url(#rooHair)"
        stroke="#5B2A22"
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <Path
        d="M 27.4 31
           C 34.8 30.4 42.7 26.3 48.4 16.3
           C 52.3 22.8 59.6 27.6 71.2 29.1
           L 72.1 35.1
           C 65.5 34.6 59.4 32 54.8 28.5
           C 48.2 32.3 40.3 32.1 34.4 28.6
           C 31.8 31.7 29.2 33 27.4 33.2 Z"
        fill="url(#rooHair)"
      />
      <Path d="M 35.4 16 C 35 20.5 32.7 26 28.6 31" stroke="#DD8C55" strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.55} />
      <Path d="M 49.1 12.5 C 51.2 18.5 55.3 23.2 61 26.5" stroke="#DD8C55" strokeWidth={1.05} strokeLinecap="round" fill="none" opacity={0.45} />
      <Ellipse cx={46} cy={10.5} rx={5.4} ry={1.7} fill="#EBA26B" opacity={0.42} />

      <Ellipse cx={36.4} cy={45} rx={5.6} ry={3.8} fill="url(#rooBlush)" />
      <Ellipse cx={63.6} cy={45} rx={5.6} ry={3.8} fill="url(#rooBlush)" />
      <Rect x={47.2} y={40.3} width={5.6} height={4.6} rx={2} fill="#FF765C" opacity={0.78} />

      <Ellipse cx={42} cy={37.5} rx={3.45} ry={4.2} fill="#3C1D1B" />
      <Ellipse cx={58} cy={37.5} rx={3.45} ry={4.2} fill="#3C1D1B" />
      <Ellipse cx={43.1} cy={35.8} rx={1.45} ry={1.65} fill="#FFFFFF" />
      <Ellipse cx={59.1} cy={35.8} rx={1.45} ry={1.65} fill="#FFFFFF" />
      <Circle cx={41.1} cy={39} r={0.58} fill="#FFFFFF" />
      <Circle cx={57.1} cy={39} r={0.58} fill="#FFFFFF" />
      <Path d="M 43.6 48.6 C 47.5 52 52.5 52 56.4 48.6" stroke="#5B2A22" strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
