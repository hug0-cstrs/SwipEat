import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useSessionStore } from '@/stores/session.store';
import { useSessionRealtime } from '@/hooks/useSessionRealtime';
import { useRestoreSession } from '@/hooks/useSession';

type IconProps = { color: string; size: number };

export default function AppLayout() {
  const { isAuthenticated, isInitialized } = useAuth();
  const { activeSession } = useSessionStore();
  useRestoreSession();
  useSessionRealtime(activeSession?.id ?? null);
  const { bottom } = useSafeAreaInsets();

  // Utiliser useEffect pour la redirection évite de démonter l'écran de login
  // pendant que onAuthStateChange met à jour le store (race condition).
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isInitialized]);

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#a63300" size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#a63300',
        tabBarInactiveTintColor: '#acadac',
        tabBarStyle: {
          backgroundColor: '#f6f6f5',
          borderTopColor: '#e7e8e7',
          borderTopWidth: 1,
          height: 60 + bottom,
          paddingBottom: 8 + bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          title: 'Session',
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* match est un écran modal, pas un onglet — caché de la tab bar */}
      <Tabs.Screen
        name="match"
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
