import { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useSessionStore } from '@/stores/session.store';

// ── Particule de célébration ──────────────────────────────────
interface ConfettiParticleProps {
  offsetX: number;
  delay: number;
  color: string;
  size: number;
}

function ConfettiParticle({ offsetX, delay, color, size }: ConfettiParticleProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(
      delay,
      withTiming(500, { duration: 1800, easing: Easing.out(Easing.quad) }),
    );
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(offsetX * 0.5, { duration: 900 }),
        withTiming(offsetX, { duration: 900 }),
      ),
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * 3, { duration: 1800 }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: '50%',
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

// ── Données confetti stables (évite re-génération à chaque render) ──
const CONFETTI_COLORS = ['#a63300', '#ff7949', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899'];
const CONFETTI_PARTICLES: ConfettiParticleProps[] = [
  { offsetX: -140, delay: 0,   color: CONFETTI_COLORS[0]!, size: 10 },
  { offsetX:  120, delay: 60,  color: CONFETTI_COLORS[1]!, size: 7  },
  { offsetX: -80,  delay: 120, color: CONFETTI_COLORS[2]!, size: 12 },
  { offsetX:  160, delay: 30,  color: CONFETTI_COLORS[3]!, size: 8  },
  { offsetX: -50,  delay: 180, color: CONFETTI_COLORS[4]!, size: 6  },
  { offsetX:  90,  delay: 90,  color: CONFETTI_COLORS[5]!, size: 11 },
  { offsetX: -120, delay: 150, color: CONFETTI_COLORS[1]!, size: 7  },
  { offsetX:  40,  delay: 210, color: CONFETTI_COLORS[0]!, size: 9  },
  { offsetX: -30,  delay: 270, color: CONFETTI_COLORS[3]!, size: 6  },
  { offsetX:  130, delay: 240, color: CONFETTI_COLORS[2]!, size: 8  },
  { offsetX: -160, delay: 300, color: CONFETTI_COLORS[5]!, size: 10 },
  { offsetX:  70,  delay: 330, color: CONFETTI_COLORS[4]!, size: 7  },
];

// ── Écran principal ───────────────────────────────────────────
export default function MatchScreen() {
  const { matchedDish } = useSessionStore();

  const cardScale = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(40);

  useEffect(() => {
    // Titre
    titleOpacity.value = withTiming(1, { duration: 300 });
    titleScale.value = withSequence(
      withSpring(1.4, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 150 }),
    );
    // Carte
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    cardScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 120 }));
    // Boutons
    buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    buttonsTranslateY.value = withDelay(600, withSpring(0, { damping: 14, stiffness: 120 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonsTranslateY.value }],
    opacity: buttonsOpacity.value,
  }));

  // Sécurité : si on arrive ici sans matchedDish, rediriger
  if (!matchedDish) {
    router.replace('/(app)');
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>

      {/* Confettis */}
      <View
        style={{ position: 'absolute', top: 80, left: 0, right: 0, height: 0, zIndex: 10, pointerEvents: 'none' }}
      >
        {CONFETTI_PARTICLES.map((p, i) => (
          <ConfettiParticle key={i} {...p} />
        ))}
      </View>

      <View className="flex-1 items-center justify-center px-6">

        {/* Titre MATCH! */}
        <Animated.View style={titleStyle} className="items-center mb-6">
          <Text style={{ fontSize: 56 }}>🎉</Text>
          <Text
            className="font-jakarta-extrabold text-5xl text-primary mt-2"
            style={{ letterSpacing: 4 }}
          >
            MATCH !
          </Text>
          <Text className="font-jakarta-semibold text-base text-on-surface-variant mt-1 text-center">
            Vous aimez tous les deux ce plat !
          </Text>
        </Animated.View>

        {/* Carte du plat */}
        <Animated.View
          style={[
            {
              width: '100%',
              maxWidth: 320,
              borderRadius: 24,
              overflow: 'hidden',
              elevation: 12,
              shadowColor: '#a63300',
              shadowOpacity: 0.25,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
            },
            cardStyle,
          ]}
        >
          {matchedDish.image_url ? (
            <Image
              source={{ uri: matchedDish.image_url }}
              style={{ width: '100%', height: 200 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: 200,
                backgroundColor: '#ffe8dc',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 64 }}>🍽️</Text>
            </View>
          )}
          <LinearGradient
            colors={['#fff5f0', '#ffffff']}
            style={{ padding: 20 }}
          >
            <Text className="font-jakarta-extrabold text-xl text-on-surface">
              {matchedDish.name}
            </Text>
            {matchedDish.cuisine_type ? (
              <Text className="font-jakarta text-sm text-on-surface-variant mt-1">
                {matchedDish.cuisine_type}
                {matchedDish.prep_time ? ` · ${matchedDish.prep_time} min` : ''}
              </Text>
            ) : null}
            {matchedDish.description ? (
              <Text
                className="font-jakarta text-sm text-on-surface-variant mt-2"
                numberOfLines={2}
              >
                {matchedDish.description}
              </Text>
            ) : null}
          </LinearGradient>
        </Animated.View>

        {/* Boutons */}
        <Animated.View
          style={[{ width: '100%', maxWidth: 320, marginTop: 32, gap: 12 }, buttonsStyle]}
        >
          <Pressable
            onPress={() => router.replace('/(app)')}
            className="rounded-full h-14 items-center justify-center active:opacity-80"
            style={{ backgroundColor: '#a63300' }}
          >
            <Text className="font-jakarta-bold text-base text-on-primary">
              Continuer à swiper
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/(app)/session')}
            className="rounded-full h-12 items-center justify-center border border-outline-variant active:opacity-70"
          >
            <Text className="font-jakarta-semibold text-sm text-on-surface">
              Voir la session
            </Text>
          </Pressable>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}
