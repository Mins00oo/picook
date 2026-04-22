import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { colors, fontFamily } from '../../constants/theme';

interface PicookLogoProps {
  size?: number; // 총 글씨 크기 (px)
}

export function PicookLogo({ size = 22 }: PicookLogoProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.base, { fontSize: size, color: colors.textPrimary }]}>pi</Text>
      <Text style={[styles.base, { fontSize: size, color: colors.primary }]}>cook</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  base: {
    fontFamily: fontFamily.extrabold,
    letterSpacing: -1.2,
    includeFontPadding: false,
  },
});
