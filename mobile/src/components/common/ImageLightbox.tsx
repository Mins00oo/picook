import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';

interface Props {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}

export function ImageLightbox({ visible, uri, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseX = useSharedValue(0);
  const baseY = useSharedValue(0);

  const reset = () => {
    scale.value = withTiming(1);
    baseScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    baseX.value = 0;
    baseY.value = 0;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(baseScale.value * e.scale, 4));
    })
    .onEnd(() => {
      baseScale.value = scale.value;
      if (scale.value <= 1.05) {
        scale.value = withTiming(1);
        baseScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        baseX.value = 0;
        baseY.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .maxPointers(2)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = baseX.value + e.translationX;
        translateY.value = baseY.value + e.translationY;
      }
    })
    .onEnd(() => {
      baseX.value = translateX.value;
      baseY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        baseScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        baseX.value = 0;
        baseY.value = 0;
      } else {
        scale.value = withTiming(2);
        baseScale.value = 2;
      }
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .requireExternalGestureToFail(doubleTap)
    .onStart(() => {
      if (scale.value <= 1.05) {
        runOnJS(handleClose)();
      }
    });

  const composed = Gesture.Simultaneous(
    Gesture.Race(doubleTap, singleTap),
    Gesture.Simultaneous(pinch, pan),
  );

  const imgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <GestureHandlerRootView style={styles.root}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.85}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M6 6l12 12M6 18l12-12" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.imgWrap, imgStyle, { width, height }]}>
            {uri && (
              <Image
                source={{ uri }}
                style={{ width, height: height * 0.85 }}
                contentFit="contain"
              />
            )}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
