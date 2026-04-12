import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

import { useSessionStore } from '@/stores/session.store';
import {
  useCreateSession,
  useJoinSession,
  useCloseSession,
  useSessionDetail,
} from '@/hooks/useSession';
import { Avatar } from '@/components/ui/Avatar';

// ── Vue : aucune session active ─────────────────────────────
function IdleView() {
  const [code, setCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const createMutation = useCreateSession();
  const joinMutation = useJoinSession();

  function handleJoin(): void {
    if (code.trim().length < 6) {
      Alert.alert('Code invalide', 'Le code doit faire 6 caractères.');
      return;
    }
    joinMutation.mutate(code);
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Illustration */}
      <View className="items-center py-8">
        <Text style={{ fontSize: 72 }}>🍽️</Text>
        <Text className="font-jakarta-extrabold text-2xl text-on-surface mt-4 text-center">
          Swipe en duo
        </Text>
        <Text className="font-jakarta text-sm text-on-surface-variant mt-2 text-center px-4">
          Crée une session et partage le code à ton partenaire. Swipez ensemble et trouvez le plat qui vous correspond !
        </Text>
      </View>

      {/* Créer */}
      <Pressable
        onPress={() => createMutation.mutate()}
        disabled={createMutation.isPending}
        className="rounded-full h-14 items-center justify-center active:opacity-80 mb-4"
        style={{ backgroundColor: '#a63300' }}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#ffefeb" />
        ) : (
          <Text className="font-jakarta-bold text-base text-on-primary">Créer une session</Text>
        )}
      </Pressable>

      {/* Rejoindre */}
      {!showJoin ? (
        <Pressable
          onPress={() => setShowJoin(true)}
          className="rounded-full h-14 items-center justify-center border border-outline-variant active:opacity-70"
        >
          <Text className="font-jakarta-bold text-base text-on-surface">Rejoindre avec un code</Text>
        </Pressable>
      ) : (
        <View style={{ gap: 12 }}>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            placeholder="EX : AB3K7Z"
            placeholderTextColor="#acadac"
            autoCapitalize="characters"
            maxLength={6}
            className="h-14 bg-surface-container-low rounded-2xl px-5 font-jakarta-bold text-xl text-on-surface text-center tracking-widest"
          />
          <Pressable
            onPress={handleJoin}
            disabled={joinMutation.isPending}
            className="rounded-full h-14 items-center justify-center active:opacity-80"
            style={{ backgroundColor: '#a63300' }}
          >
            {joinMutation.isPending ? (
              <ActivityIndicator color="#ffefeb" />
            ) : (
              <Text className="font-jakarta-bold text-base text-on-primary">Rejoindre</Text>
            )}
          </Pressable>
          {joinMutation.isError && (
            <Text className="font-jakarta text-sm text-error text-center">
              {joinMutation.error.message}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ── Vue : session en attente ou active ──────────────────────
function ActiveSessionView() {
  const { activeSession } = useSessionStore();
  const closeMutation = useCloseSession();
  const { data: detail, isLoading, refetch } = useSessionDetail(activeSession?.id ?? null);

  if (!activeSession) return null;

  // Capturer dans une variable locale pour que TypeScript puisse la narrower dans les closures
  const session = activeSession;
  const isWaiting = session.status === 'waiting';
  const sessionUrl = `swipeat://session/${session.code}`;

  function handleShare(): void {
    void Share.share({
      message: `Rejoins ma session SwipEat avec le code : ${session.code}`,
      title: 'SwipEat — Session duo',
    });
  }

  function confirmClose(): void {
    Alert.alert(
      'Fermer la session',
      'La session sera terminée pour tous les participants.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Fermer',
          style: 'destructive',
          onPress: () => closeMutation.mutate(),
        },
      ],
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Statut */}
      <View className="flex-row items-center justify-center mb-6" style={{ gap: 8 }}>
        <View
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isWaiting ? '#F59E0B' : '#22C55E' }}
        />
        <Text className="font-jakarta-semibold text-sm text-on-surface-variant">
          {isWaiting ? 'En attente d\'un partenaire…' : 'Session active'}
        </Text>
      </View>

      {/* QR Code */}
      {isWaiting && (
        <View className="items-center mb-6">
          <View className="bg-white p-5 rounded-3xl" style={{ elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
            <QRCode value={sessionUrl} size={180} />
          </View>
        </View>
      )}

      {/* Code */}
      <Pressable
        onPress={handleShare}
        className="bg-surface-container-low rounded-2xl items-center py-5 mb-3 active:opacity-70"
      >
        <Text className="font-jakarta text-xs text-on-surface-variant mb-1 uppercase tracking-widest">
          Code de session
        </Text>
        <Text className="font-jakarta-extrabold text-4xl text-primary tracking-widest">
          {activeSession.code}
        </Text>
        <View className="flex-row items-center mt-2" style={{ gap: 6 }}>
          <Ionicons name="share-outline" size={14} color="#5a5c5b" />
          <Text className="font-jakarta text-xs text-on-surface-variant">Appuie pour partager</Text>
        </View>
      </Pressable>

      {/* Participants */}
      <View className="bg-surface-container-low rounded-2xl px-4 py-3 mb-6">
        <Text className="font-jakarta-semibold text-xs text-on-surface-variant uppercase tracking-wider mb-3">
          Participants
        </Text>
        {isLoading ? (
          <ActivityIndicator color="#a63300" size="small" />
        ) : (
          <View style={{ gap: 12 }}>
            {(detail?.participants ?? []).map((p) => (
              <View key={p.user_id} className="flex-row items-center" style={{ gap: 12 }}>
                <Avatar name={p.name} size={36} />
                <Text className="font-jakarta-semibold text-sm text-on-surface">{p.name}</Text>
              </View>
            ))}
            {isWaiting && (
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <View className="w-9 h-9 rounded-full bg-surface-container items-center justify-center">
                  <Ionicons name="person-add-outline" size={16} color="#acadac" />
                </View>
                <Text className="font-jakarta text-sm text-on-surface-variant">
                  En attente…
                </Text>
                <Pressable onPress={() => void refetch()} className="ml-auto active:opacity-60">
                  <Ionicons name="refresh-outline" size={18} color="#a63300" />
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>

      {/* CTA swipe */}
      {!isWaiting && (
        <Pressable
          onPress={() => router.push('/(app)')}
          className="rounded-full h-14 items-center justify-center mb-3 active:opacity-80"
          style={{ backgroundColor: '#a63300' }}
        >
          <Text className="font-jakarta-bold text-base text-on-primary">🍽️ Go swiper !</Text>
        </Pressable>
      )}

      {/* Fermer la session */}
      <Pressable
        onPress={confirmClose}
        disabled={closeMutation.isPending}
        className="rounded-full h-12 items-center justify-center border border-outline-variant active:opacity-70"
      >
        {closeMutation.isPending ? (
          <ActivityIndicator size="small" color="#b31b25" />
        ) : (
          <Text className="font-jakarta-bold text-sm text-error">
            {session.owner_id === detail?.participants[0]?.user_id ? 'Fermer la session' : 'Quitter la session'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

// ── Écran principal ─────────────────────────────────────────
export default function SessionScreen() {
  const { activeSession } = useSessionStore();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="px-5 py-3">
        <Text className="font-jakarta-extrabold text-xl text-primary">Session</Text>
      </View>
      {activeSession ? <ActiveSessionView /> : <IdleView />}
    </SafeAreaView>
  );
}
