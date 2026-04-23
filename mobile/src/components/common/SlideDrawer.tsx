import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadow } from '../../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  width?: number | string;
  side?: 'right' | 'left';
  children: React.ReactNode;
  panelStyle?: ViewStyle;
}

export function SlideDrawer({
  visible, onClose, width = '82%', side = 'right', children, panelStyle,
}: Props) {
  const { width: screenW } = useWindowDimensions();
  const panelW = typeof width === 'number' ? width : screenW * (parseFloat(width) / 100);
  const hidden = side === 'right' ? panelW : -panelW;

  const translateX = useSharedValue(hidden);
  const scrimOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(visible ? 0 : hidden, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
    scrimOpacity.value = withTiming(visible ? 1 : 0, { duration: 240 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, hidden]);

  const panelStyleAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            side === 'right' ? { right: 0 } : { left: 0 },
            { width: panelW },
            panelStyleAnim,
            panelStyle,
          ]}
        >
          <SafeAreaView style={styles.inner} edges={['top', 'bottom']}>
            {children}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(31,22,18,0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.background,
    ...shadow.lg,
  },
  inner: {
    flex: 1,
  },
});
