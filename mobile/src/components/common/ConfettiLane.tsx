import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect, Circle } from 'react-native-svg';

type Shape = 'square' | 'circle' | 'pill';
interface PieceConfig {
  leftPct: number;
  delayMs: number;
  durationMs: number;
  sway: boolean;
  size: number;
  color: string;
  shape: Shape;
  rotateDeg: number;
}

// 프로토타입 picook_cook_finish_v1.0.html 의 .cf-1 ~ .cf-12 수치 재현
const PIECES: PieceConfig[] = [
  { leftPct:  8, delayMs:    0, durationMs: 6000, sway: false, size: 8,  color: '#FF6B4A', shape: 'square', rotateDeg:  25 },
  { leftPct: 18, delayMs: 1800, durationMs: 5500, sway: true,  size: 6,  color: '#FFE9A8', shape: 'circle', rotateDeg:   0 },
  { leftPct: 26, delayMs:  800, durationMs: 7000, sway: false, size: 10, color: '#FFD4C2', shape: 'pill',   rotateDeg:   0 },
  { leftPct: 35, delayMs: 3000, durationMs: 6000, sway: true,  size: 8,  color: '#D5E9D4', shape: 'square', rotateDeg: -15 },
  { leftPct: 44, delayMs: 2200, durationMs: 5000, sway: false, size: 6,  color: '#FF6B4A', shape: 'circle', rotateDeg:   0 },
  { leftPct: 53, delayMs:  400, durationMs: 6500, sway: true,  size: 9,  color: '#FFE9A8', shape: 'square', rotateDeg:  45 },
  { leftPct: 62, delayMs: 2800, durationMs: 6000, sway: false, size: 5,  color: '#FFD4C2', shape: 'circle', rotateDeg:   0 },
  { leftPct: 71, delayMs: 1200, durationMs: 5500, sway: true,  size: 8,  color: '#D5E9D4', shape: 'pill',   rotateDeg:   0 },
  { leftPct: 80, delayMs: 3400, durationMs: 7000, sway: false, size: 7,  color: '#FF6B4A', shape: 'square', rotateDeg: -20 },
  { leftPct: 90, delayMs:    0, durationMs: 6000, sway: true,  size: 5,  color: '#FFE9A8', shape: 'circle', rotateDeg:   0 },
  { leftPct: 14, delayMs: 4000, durationMs: 7000, sway: true,  size: 6,  color: '#FFD4C2', shape: 'square', rotateDeg:  30 },
  { leftPct: 58, delayMs: 4500, durationMs: 5500, sway: false, size: 5,  color: '#D5E9D4', shape: 'circle', rotateDeg:   0 },
];

function Piece({ leftPct, delayMs, durationMs, sway, size, color, shape, rotateDeg }: PieceConfig) {
  const translateY = useSharedValue(-14);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delayMs,
      withRepeat(withTiming(260, { duration: durationMs, easing: Easing.linear }), -1, false),
    );
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.9, { duration: durationMs * 0.1 }),
          withTiming(0.9, { duration: durationMs * 0.8 }),
          withTiming(0, { duration: durationMs * 0.1 }),
        ),
        -1,
        false,
      ),
    );
    rotate.value = withDelay(
      delayMs,
      withRepeat(withTiming(180, { duration: durationMs, easing: Easing.linear }), -1, false),
    );
    if (sway) {
      translateX.value = withDelay(
        delayMs,
        withRepeat(
          withSequence(
            withTiming(8, { duration: durationMs / 2, easing: Easing.inOut(Easing.sin) }),
            withTiming(-4, { duration: durationMs / 2, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          false,
        ),
      );
    }
    return () => {
      // reanimated sharedValue는 언마운트 시 GC됨
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value + rotateDeg}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.piece, { left: `${leftPct}%` }, animStyle]} pointerEvents="none">
      {renderShape(shape, size, color)}
    </Animated.View>
  );
}

function renderShape(shape: Shape, size: number, color: string) {
  if (shape === 'circle') {
    return (
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />
      </Svg>
    );
  }
  if (shape === 'pill') {
    return (
      <Svg width={size} height={4}>
        <Rect width={size} height={4} rx={1.5} fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size}>
      <Rect width={size} height={size} rx={1.5} fill={color} />
    </Svg>
  );
}

interface Props {
  height?: number;
  style?: ViewStyle;
}

export function ConfettiLane({ height = 280, style }: Props) {
  return (
    <View style={[styles.lane, { height }, style]} pointerEvents="none">
      {PIECES.map((p, i) => (
        <Piece key={i} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lane: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: -14,
  },
});
