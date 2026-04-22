import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  value: number; // 0~5
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
  spacing?: number;
}

const ON_COLOR = '#FFB43B';
const OFF_COLOR = '#F0E6DC';

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2l2.92 6.05 6.68.58-5.06 4.42 1.56 6.54L12 16.3l-6.1 3.29 1.56-6.54L2.4 8.63l6.68-.58L12 2z"
        fill={filled ? ON_COLOR : OFF_COLOR}
      />
    </Svg>
  );
}

export function RatingStars({ value, onChange, size = 28, readonly, spacing = 6 }: Props) {
  return (
    <View style={[styles.row, { gap: spacing }]}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return readonly ? (
          <View key={n}>
            <Star filled={filled} size={size} />
          </View>
        ) : (
          <TouchableOpacity
            key={n}
            onPress={() => onChange?.(n === value ? 0 : n)}
            activeOpacity={0.6}
            hitSlop={4}
          >
            <Star filled={filled} size={size} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
