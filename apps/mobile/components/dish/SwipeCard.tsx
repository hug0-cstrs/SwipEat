import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import type { Database } from '@swipeat/types';
import { DishCard } from './DishCard';

type Dish = Database['public']['Tables']['dishes']['Row'];
export type SwipeDirection = 'right' | 'left' | 'up';

// ── Thresholds ──────────────────────────────────────────────
const SWIPE_X_THRESHOLD = 100;
const SWIPE_Y_THRESHOLD = 80;
const EXIT_X = 600;
const EXIT_Y = 800;
const ROTATION_MAX = 12; // degrees
const SPRING_CONFIG = { damping: 20, stiffness: 300 };

interface SwipeCardProps {
  dish: Dish;
  onSwipe: (direction: SwipeDirection) => void;
  /**
   * Position dans la pile — 0 = carte active (avec geste),
   * 1+ = cartes en arrière-plan (sans geste, légèrement réduites)
   */
  index?: number;
}

export function SwipeCard({ dish, onSwipe, index = 0 }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // ── Gesture ─────────────────────────────────────────────
  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onChange((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onFinalize(() => {
      'worklet';
      if (translateX.value > SWIPE_X_THRESHOLD) {
        translateX.value = withTiming(EXIT_X, { duration: 280 }, (finished) => {
          if (finished) runOnJS(onSwipe)('right');
        });
      } else if (translateX.value < -SWIPE_X_THRESHOLD) {
        translateX.value = withTiming(-EXIT_X, { duration: 280 }, (finished) => {
          if (finished) runOnJS(onSwipe)('left');
        });
      } else if (translateY.value < -SWIPE_Y_THRESHOLD) {
        translateY.value = withTiming(-EXIT_Y, { duration: 280 }, (finished) => {
          if (finished) runOnJS(onSwipe)('up');
        });
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  // ── Animated styles ─────────────────────────────────────
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate:
          interpolate(
            translateX.value,
            [-300, 0, 300],
            [-ROTATION_MAX, 0, ROTATION_MAX],
            Extrapolation.CLAMP,
          ) + 'deg',
      },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_X_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -SWIPE_X_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const superlikeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, -SWIPE_Y_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  // ── Background card (pile) ───────────────────────────────
  if (index > 0) {
    const scale = 1 - index * 0.04;
    const offsetY = index * 10;
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ scale }, { translateY: -offsetY }] },
        ]}
        pointerEvents="none"
      >
        <DishCard dish={dish} />
      </View>
    );
  }

  // ── Active card ─────────────────────────────────────────
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[StyleSheet.absoluteFillObject, cardStyle]}>
        <DishCard dish={dish} />

        {/* Like indicator */}
        <Animated.View
          style={[styles.indicator, styles.indicatorTopLeft, likeStyle]}
          pointerEvents="none"
        >
          <Text style={[styles.indicatorText, { color: '#22C55E', borderColor: '#22C55E' }]}>
            LIKE
          </Text>
        </Animated.View>

        {/* Pass indicator */}
        <Animated.View
          style={[styles.indicator, styles.indicatorTopRight, passStyle]}
          pointerEvents="none"
        >
          <Text style={[styles.indicatorText, { color: '#EF4444', borderColor: '#EF4444' }]}>
            NOPE
          </Text>
        </Animated.View>

        {/* Superlike indicator */}
        <Animated.View
          style={[styles.indicator, styles.indicatorBottom, superlikeStyle]}
          pointerEvents="none"
        >
          <Text style={[styles.indicatorText, { color: '#F59E0B', borderColor: '#F59E0B' }]}>
            SUPER
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    padding: 8,
  },
  indicatorTopLeft: {
    top: 40,
    left: 24,
    transform: [{ rotate: '-15deg' }],
  },
  indicatorTopRight: {
    top: 40,
    right: 24,
    transform: [{ rotate: '15deg' }],
  },
  indicatorBottom: {
    bottom: 120,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 2,
    borderWidth: 4,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
