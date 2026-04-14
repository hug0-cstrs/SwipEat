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

import { useAuthStore } from '@/stores/auth.store';
import { useSessionStore } from '@/stores/session.store';
import {
  useCreateSession,
  useJoinSession,
  useCloseSession,
  useSessionDetail,
  useSessionHistory,
  type SessionHistoryItem,
} from '@/hooks/useSession';
import { Avatar } from '@/components/ui/Avatar';

// ── Badge de statut ─────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    matched: { label: 'Matchée',    bg: '#dcfce7', color: '#15803d' },
    closed:  { label: 'Terminée',   bg: '#fee2e2', color: '#b91c1c' },
    active:  { label: 'Active',     bg: '#dbeafe', color: '#1d4ed8' },
    waiting: { label: 'En attente', bg: '#fef9c3', color: '#854d0e' },
  };
  const { label, bg, color } = config[status] ?? { label: status, bg: '#f3f4f6', color: '#374151' };

  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
        {label}
      </Text>
    </View>
  );
}

// ── Carte session passée ─────────────────────────────────────
function HistoryCard({ item }: { item: SessionHistoryItem }) {
  const date = new Date(item.created_at);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View
      className="bg-surface-container-low rounded-2xl px-4 py-4 mb-3"
      style={{ gap: 8 }}
    >
      {/* Ligne 1 : code + statut */}
      <View className="flex-row items-center justify-between">
        <Text className="font-jakarta-extrabold text-base text-on-surface tracking-widest">
          {item.code}
        </Text>
        <StatusBadge status={item.status} />
      </View>

      {/* Ligne 2 : participants */}
      {item.participantNames.length > 0 && (
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Ionicons name="people-outline" size={13} color="#acadac" />
          <Text className="font-jakarta text-xs text-on-surface-variant">
            {item.participantNames.join(' · ')}
          </Text>
        </View>
      )}

      {/* Ligne 3 : date */}
      <View className="flex-row items-center" style={{ gap: 4 }}>
        <Ionicons name="calendar-outline" size={13} color="#acadac" />
        <Text className="font-jakarta text-xs text-on-surface-variant">{formattedDate}</Text>
      </View>

      {/* Plat matché */}
      {item.matchedDishName ? (
        <View
          className="flex-row items-center rounded-xl bg-surface-container px-3 py-2"
          style={{ gap: 8 }}
        >
          <Text style={{ fontSize: 16 }}>🍽️</Text>
          <View style={{ flex: 1 }}>
            <Text className="font-jakarta text-xs text-on-surface-variant">Plat matché</Text>
            <Text className="font-jakarta-semibold text-sm text-on-surface" numberOfLines={1}>
              {item.matchedDishName}
            </Text>
          </View>
          <Ionicons name="heart" size={14} color="#22C55E" />
        </View>
      ) : null}
    </View>
  );
}

// ── Section historique ───────────────────────────────────────
function HistorySection({ activeSessionId }: { activeSessionId: string | undefined }) {
  const { data: history, isLoading } = useSessionHistory();

  const past = (history ?? []).filter(
    (s) => s.id !== activeSessionId && (s.status === 'closed' || s.status === 'matched'),
  );

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" color="#a63300" />
      </View>
    );
  }

  if (past.length === 0) return null;

  return (
    <View>
      <Text className="font-jakarta-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3">
        Sessions passées
      </Text>
      {past.map((item) => (
        <HistoryCard key={item.id} item={item} />
      ))}
    </View>
  );
}

// ── Vue : pas de session active ──────────────────────────────
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
    <View style={{ gap: 12 }}>
      {/* Illustration */}
      <View className="items-center py-6">
        <Text style={{ fontSize: 64 }}>🍽️</Text>
        <Text className="font-jakarta-extrabold text-xl text-on-surface mt-3 text-center">
          Swipe en duo
        </Text>
        <Text className="font-jakarta text-sm text-on-surface-variant mt-1 text-center">
          Crée une session et partage le code à ton partenaire.
        </Text>
      </View>

      {/* Créer */}
      <Pressable
        onPress={() => createMutation.mutate()}
        disabled={createMutation.isPending}
        className="rounded-full h-14 items-center justify-center active:opacity-80"
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
          <Text className="font-jakarta-bold text-base text-on-surface">
            Rejoindre avec un code
          </Text>
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
    </View>
  );
}

// ── Carte de session active ──────────────────────────────────
function ActiveSessionCard() {
  const { activeSession } = useSessionStore();
  const { session: authSession } = useAuthStore();
  const closeMutation = useCloseSession();
  const { data: detail, isLoading, refetch } = useSessionDetail(activeSession?.id ?? null);

  if (!activeSession) return null;

  const session = activeSession;
  const isWaiting = session.status === 'waiting';
  const sessionUrl = `swipeat://session/${session.code}`;
  const isOwner = session.owner_id === authSession?.user.id;

  function handleShare(): void {
    void Share.share({
      message: `Rejoins ma session SwipEat avec le code : ${session.code}`,
      title: 'SwipEat — Session duo',
    });
  }

  function confirmClose(): void {
    Alert.alert(
      isOwner ? 'Fermer la session' : 'Quitter la session',
      isOwner
        ? 'La session sera terminée pour tous les participants.'
        : 'Tu vas quitter la session.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: isOwner ? 'Fermer' : 'Quitter',
          style: 'destructive',
          onPress: () => closeMutation.mutate(),
        },
      ],
    );
  }

  return (
    <View
      className="bg-surface-container-low rounded-3xl overflow-hidden mb-6"
      style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
    >
      {/* Bandeau statut */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ backgroundColor: isWaiting ? '#fef9c3' : '#dcfce7' }}
      >
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isWaiting ? '#d97706' : '#16a34a' }}
          />
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_600SemiBold',
              fontSize: 12,
              color: isWaiting ? '#854d0e' : '#15803d',
            }}
          >
            {isWaiting ? 'En attente d\'un partenaire…' : 'Session active'}
          </Text>
        </View>
        <Pressable onPress={confirmClose} disabled={closeMutation.isPending} className="active:opacity-60">
          {closeMutation.isPending ? (
            <ActivityIndicator size="small" color="#b31b25" />
          ) : (
            <Ionicons name="close-circle-outline" size={20} color="#b31b25" />
          )}
        </Pressable>
      </View>

      <View className="px-4 py-4" style={{ gap: 16 }}>
        {/* QR Code */}
        {isWaiting && (
          <View className="items-center">
            <View
              className="bg-white p-4 rounded-2xl"
              style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
            >
              <QRCode value={sessionUrl} size={150} />
            </View>
          </View>
        )}

        {/* Code */}
        <Pressable
          onPress={handleShare}
          className="bg-surface-container rounded-2xl items-center py-4 active:opacity-70"
        >
          <Text className="font-jakarta text-xs text-on-surface-variant uppercase tracking-widest mb-1">
            Code de session
          </Text>
          <Text className="font-jakarta-extrabold text-4xl text-primary tracking-widest">
            {session.code}
          </Text>
          <View className="flex-row items-center mt-2" style={{ gap: 5 }}>
            <Ionicons name="share-outline" size={13} color="#5a5c5b" />
            <Text className="font-jakarta text-xs text-on-surface-variant">Appuie pour partager</Text>
          </View>
        </Pressable>

        {/* Participants */}
        <View>
          <Text className="font-jakarta-semibold text-xs text-on-surface-variant uppercase tracking-wider mb-2">
            Participants
          </Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#a63300" />
          ) : (
            <View style={{ gap: 10 }}>
              {(detail?.participants ?? []).map((p) => (
                <View key={p.user_id} className="flex-row items-center" style={{ gap: 10 }}>
                  <Avatar name={p.name} size={32} />
                  <Text className="font-jakarta-semibold text-sm text-on-surface">{p.name}</Text>
                </View>
              ))}
              {isWaiting && (
                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <View className="w-8 h-8 rounded-full bg-surface-container items-center justify-center">
                    <Ionicons name="person-add-outline" size={15} color="#acadac" />
                  </View>
                  <Text className="font-jakarta text-sm text-on-surface-variant flex-1">
                    En attente…
                  </Text>
                  <Pressable onPress={() => void refetch()} className="active:opacity-60">
                    <Ionicons name="refresh-outline" size={17} color="#a63300" />
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
            className="rounded-full h-12 items-center justify-center active:opacity-80"
            style={{ backgroundColor: '#a63300' }}
          >
            <Text className="font-jakarta-bold text-sm text-on-primary">🍽️ Go swiper !</Text>
          </Pressable>
        )}
      </View>
    </View>
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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Session en cours ou boutons de création/rejoindre */}
        {activeSession ? <ActiveSessionCard /> : <IdleView />}

        {/* Séparateur */}
        <View className="my-4" />

        {/* Historique des sessions passées */}
        <HistorySection activeSessionId={activeSession?.id} />
      </ScrollView>
    </SafeAreaView>
  );
}
