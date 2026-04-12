import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useSwipe } from '@/hooks/useSwipe';
import { useSessionStore } from '@/stores/session.store';
import { SwipeCard } from '@/components/dish/SwipeCard';

export default function HomeScreen() {
  const { activeSession } = useSessionStore();
  // Les swipes sont enregistrés dès qu'une session existe, même en "waiting".
  // Quand le partenaire rejoint et swipe le même plat → match détecté.
  const { deck, isLoading, isError, handleSwipe } = useSwipe({ sessionId: activeSession?.id });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>

      {/* ── Header ───────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Text className="font-jakarta-extrabold text-xl text-primary">SwipEat</Text>
        <Pressable
          onPress={() => router.push('/(app)/session')}
          className="bg-surface-container-low rounded-full p-2 active:opacity-70"
        >
          <Ionicons name="people-outline" size={22} color={activeSession ? '#a63300' : '#5a5c5b'} />
          {activeSession && (
            <View
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeSession.status === 'active' ? '#22C55E' : '#F59E0B' }}
            />
          )}
        </Pressable>
      </View>

      {/* ── Card deck ────────────────────────────────────────── */}
      <View className="flex-1 px-4 pb-3">

        {isLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#a63300" size="large" />
            <Text className="font-jakarta text-sm text-on-surface-variant mt-3">
              Chargement des plats…
            </Text>
          </View>
        )}

        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center px-8">
            <Text style={{ fontSize: 40 }}>⚠️</Text>
            <Text className="font-jakarta-bold text-lg text-on-surface mt-4 text-center">
              Impossible de charger les plats
            </Text>
            <Text className="font-jakarta text-sm text-on-surface-variant mt-2 text-center">
              Vérifie ta connexion et réessaie.
            </Text>
          </View>
        )}

        {!isLoading && !isError && deck.length === 0 && (
          <View className="flex-1 items-center justify-center px-8">
            <Text style={{ fontSize: 48 }}>🍽️</Text>
            <Text className="font-jakarta-extrabold text-xl text-on-surface mt-4 text-center">
              C'est tout pour aujourd'hui !
            </Text>
            <Text className="font-jakarta text-sm text-on-surface-variant mt-2 text-center">
              Tu as découvert tous les plats. Reviens demain pour de nouvelles suggestions.
            </Text>
          </View>
        )}

        {!isLoading && deck.length > 0 && (
          <View className="flex-1">
            {/* Cartes d'arrière-plan (index 2 et 1 rendues en premier = derrière) */}
            {deck[2] !== undefined && (
              <SwipeCard key={deck[2].id} dish={deck[2]} index={2} onSwipe={handleSwipe} />
            )}
            {deck[1] !== undefined && (
              <SwipeCard key={deck[1].id} dish={deck[1]} index={1} onSwipe={handleSwipe} />
            )}
            {/* Carte active sur le dessus */}
            {deck[0] !== undefined && (
              <SwipeCard key={deck[0].id} dish={deck[0]} index={0} onSwipe={handleSwipe} />
            )}
          </View>
        )}

      </View>

      {/* ── Action buttons ───────────────────────────────────── */}
      {!isLoading && deck.length > 0 && (
        <View className="flex-row justify-center items-center pb-4" style={{ gap: 20 }}>

          {/* Pass */}
          <Pressable
            onPress={() => void handleSwipe('left')}
            className="w-14 h-14 rounded-full bg-surface-container-lowest items-center justify-center active:opacity-75"
            style={{ elevation: 4, shadowColor: '#EF4444', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <Ionicons name="close" size={30} color="#EF4444" />
          </Pressable>

          {/* Superlike */}
          <Pressable
            onPress={() => void handleSwipe('up')}
            className="w-12 h-12 rounded-full bg-surface-container-lowest items-center justify-center active:opacity-75"
            style={{ elevation: 4, shadowColor: '#F59E0B', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <Ionicons name="star" size={22} color="#F59E0B" />
          </Pressable>

          {/* Like */}
          <Pressable
            onPress={() => void handleSwipe('right')}
            className="w-14 h-14 rounded-full bg-surface-container-lowest items-center justify-center active:opacity-75"
            style={{ elevation: 4, shadowColor: '#22C55E', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <Ionicons name="heart" size={26} color="#22C55E" />
          </Pressable>

        </View>
      )}

    </SafeAreaView>
  );
}
