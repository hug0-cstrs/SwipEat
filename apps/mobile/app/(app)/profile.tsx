import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionStore } from '@/stores/session.store';
import { Avatar } from '@/components/ui/Avatar';

function useProfileStats(userId: string) {
  return useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      const [wishlistRes, sessionsRes] = await Promise.all([
        supabase
          .from('wishlist')
          .select('dish_id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('session_participants')
          .select('session_id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);
      return {
        wishlistCount: wishlistRes.count ?? 0,
        sessionsCount: sessionsRes.count ?? 0,
      };
    },
    staleTime: 60 * 1000,
  });
}

export default function ProfileScreen() {
  const { session, setSession } = useAuthStore();
  const { reset } = useSessionStore();
  const user = session?.user;
  const name = (user?.user_metadata?.name as string | undefined) ?? user?.email?.split('@')[0] ?? '';

  const { data: stats } = useProfileStats(user?.id ?? '');

  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setSession(null);
      reset();
      router.replace('/(auth)/login');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  function confirmLogout(): void {
    Alert.alert(
      'Se déconnecter',
      'Tu vas être redirigé vers l\'écran de connexion.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: () => logoutMutation.mutate(),
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>

      {/* Header */}
      <View className="px-5 py-3">
        <Text className="font-jakarta-extrabold text-xl text-primary">Profil</Text>
      </View>

      {/* Avatar + infos */}
      <View className="items-center px-6 pt-4 pb-8">
        <Avatar uri={user?.user_metadata?.avatar_url as string | undefined} name={name} size={88} />
        <Text className="font-jakarta-extrabold text-2xl text-on-surface mt-4">{name}</Text>
        <Text className="font-jakarta text-sm text-on-surface-variant mt-1">{user?.email}</Text>
      </View>

      {/* Stats */}
      <View className="flex-row mx-5 mb-6 rounded-2xl bg-surface-container-low overflow-hidden">
        <View className="flex-1 items-center py-5">
          <Text className="font-jakarta-extrabold text-3xl text-primary">
            {stats?.wishlistCount ?? '—'}
          </Text>
          <Text className="font-jakarta text-xs text-on-surface-variant mt-1">Plats likés</Text>
        </View>
        <View style={{ width: 1, backgroundColor: '#e7e8e7' }} />
        <View className="flex-1 items-center py-5">
          <Text className="font-jakarta-extrabold text-3xl text-primary">
            {stats?.sessionsCount ?? '—'}
          </Text>
          <Text className="font-jakarta text-xs text-on-surface-variant mt-1">Sessions</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="mx-5" style={{ gap: 12 }}>

        {/* Notifications — placeholder V2 */}
        <Pressable
          onPress={() => Alert.alert('Bientôt disponible', 'Les notifications arrivent en V2.')}
          className="flex-row items-center bg-surface-container-low rounded-2xl px-4 active:opacity-75"
          style={{ height: 56, gap: 14 }}
        >
          <Ionicons name="notifications-outline" size={22} color="#5a5c5b" />
          <Text className="flex-1 font-jakarta-semibold text-sm text-on-surface">Notifications</Text>
          <Ionicons name="chevron-forward" size={18} color="#acadac" />
        </Pressable>

        {/* Déconnexion */}
        <Pressable
          onPress={confirmLogout}
          disabled={logoutMutation.isPending}
          className="flex-row items-center bg-surface-container-low rounded-2xl px-4 active:opacity-75"
          style={{ height: 56, gap: 14 }}
        >
          {logoutMutation.isPending ? (
            <ActivityIndicator size="small" color="#b31b25" />
          ) : (
            <Ionicons name="log-out-outline" size={22} color="#b31b25" />
          )}
          <Text className="flex-1 font-jakarta-semibold text-sm text-error">Se déconnecter</Text>
        </Pressable>

      </View>

    </SafeAreaView>
  );
}
