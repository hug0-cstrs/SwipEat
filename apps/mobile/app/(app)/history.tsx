import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useSessionStore } from '@/stores/session.store';
import { useSessionHistory, useMatchHistory, type MatchHistoryItem, type SessionHistoryItem } from '@/hooks/useSession';

type Tab = 'matches' | 'sessions';

// ── Sélecteur de segment ──────────────────────────────────────
function SegmentedControl({
  active,
  matchCount,
  sessionCount,
  onChange,
}: {
  active: Tab;
  matchCount: number;
  sessionCount: number;
  onChange: (tab: Tab) => void;
}) {
  return (
    <View
      className="flex-row bg-surface-container-low rounded-full mx-5 mb-4"
      style={{ padding: 4 }}
    >
      {(
        [
          { key: 'matches', label: 'Matchs', count: matchCount },
          { key: 'sessions', label: 'Sessions', count: sessionCount },
        ] as { key: Tab; label: string; count: number }[]
      ).map(({ key, label, count }) => {
        const isActive = active === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            className="flex-1 flex-row items-center justify-center rounded-full py-2"
            style={{ backgroundColor: isActive ? '#a63300' : 'transparent', gap: 6 }}
          >
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 13,
                color: isActive ? '#ffffff' : '#5a5c5b',
              }}
            >
              {label}
            </Text>
            {count > 0 && (
              <View
                className="rounded-full items-center justify-center"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e7e8e7',
                  minWidth: 18,
                  height: 18,
                  paddingHorizontal: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                    fontSize: 10,
                    color: isActive ? '#ffffff' : '#5a5c5b',
                  }}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Carte de match ────────────────────────────────────────────
function MatchCard({ item }: { item: MatchHistoryItem }) {
  const date = new Date(item.matched_at);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View
      className="bg-surface-container-low rounded-2xl overflow-hidden mx-5 mb-3"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      {/* Image du plat */}
      {item.dishImage ? (
        <Image
          source={{ uri: item.dishImage }}
          style={{ width: '100%', height: 160 }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="items-center justify-center"
          style={{ width: '100%', height: 160, backgroundColor: '#fff5f0' }}
        >
          <Text style={{ fontSize: 52 }}>🍽️</Text>
        </View>
      )}

      {/* Infos */}
      <View className="px-4 py-3" style={{ gap: 8 }}>
        {/* Nom du plat + icône match */}
        <View className="flex-row items-center justify-between">
          <Text
            className="font-jakarta-extrabold text-base text-on-surface flex-1 mr-2"
            numberOfLines={2}
          >
            {item.dishName}
          </Text>
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: '#dcfce7' }}
          >
            <Ionicons name="heart" size={15} color="#16a34a" />
          </View>
        </View>

        {/* Participants */}
        {item.participantNames.length > 0 && (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Ionicons name="people-outline" size={13} color="#acadac" />
            <Text className="font-jakarta text-xs text-on-surface-variant flex-1" numberOfLines={1}>
              {item.participantNames.join(' · ')}
            </Text>
          </View>
        )}

        {/* Date */}
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Ionicons name="calendar-outline" size={13} color="#acadac" />
          <Text className="font-jakarta text-xs text-on-surface-variant">{formattedDate}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Ligne de session ──────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    matched:  { label: 'Matchée',    bg: '#dcfce7', text: '#15803d' },
    closed:   { label: 'Terminée',   bg: '#fee2e2', text: '#b91c1c' },
    active:   { label: 'Active',     bg: '#dbeafe', text: '#1d4ed8' },
    waiting:  { label: 'En attente', bg: '#fef9c3', text: '#854d0e' },
  };
  const { label, bg, text } = config[status] ?? { label: status, bg: '#f3f4f6', text: '#374151' };

  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color: text, fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
        {label}
      </Text>
    </View>
  );
}

function SessionRow({ item }: { item: SessionHistoryItem }) {
  const date = new Date(item.created_at);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View
      className="bg-surface-container-low rounded-2xl px-4 py-4 mx-5 mb-3"
      style={{ gap: 8 }}
    >
      {/* Code + statut */}
      <View className="flex-row items-center justify-between">
        <Text className="font-jakarta-extrabold text-base text-on-surface tracking-widest">
          {item.code}
        </Text>
        <StatusBadge status={item.status} />
      </View>

      {/* Participants */}
      {item.participantNames.length > 0 && (
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Ionicons name="people-outline" size={13} color="#acadac" />
          <Text className="font-jakarta text-xs text-on-surface-variant">
            {item.participantNames.join(' · ')}
          </Text>
        </View>
      )}

      {/* Date */}
      <View className="flex-row items-center" style={{ gap: 4 }}>
        <Ionicons name="calendar-outline" size={13} color="#acadac" />
        <Text className="font-jakarta text-xs text-on-surface-variant">{formattedDate}</Text>
      </View>

      {/* Plat matché */}
      {item.status === 'matched' && item.matchedDishName ? (
        <View
          className="flex-row items-center rounded-xl bg-surface-container px-3 py-2"
          style={{ gap: 8 }}
        >
          <Text style={{ fontSize: 16 }}>🍽️</Text>
          <View style={{ flex: 1 }}>
            <Text className="font-jakarta text-xs text-on-surface-variant">Plat matché</Text>
            <Text
              className="font-jakarta-semibold text-sm text-on-surface"
              numberOfLines={1}
            >
              {item.matchedDishName}
            </Text>
          </View>
          <Ionicons name="heart" size={14} color="#22C55E" />
        </View>
      ) : null}
    </View>
  );
}

// ── États vides ───────────────────────────────────────────────
function EmptyMatches() {
  return (
    <View className="flex-1 items-center justify-center px-8 pt-12">
      <Text style={{ fontSize: 52 }}>💚</Text>
      <Text className="font-jakarta-extrabold text-xl text-on-surface mt-4 text-center">
        Aucun match
      </Text>
      <Text className="font-jakarta text-sm text-on-surface-variant mt-2 text-center">
        Lance une session en duo et swipez les mêmes plats pour obtenir votre premier match !
      </Text>
    </View>
  );
}

function EmptySessions() {
  return (
    <View className="flex-1 items-center justify-center px-8 pt-12">
      <Text style={{ fontSize: 52 }}>📋</Text>
      <Text className="font-jakarta-extrabold text-xl text-on-surface mt-4 text-center">
        Aucune session
      </Text>
      <Text className="font-jakarta text-sm text-on-surface-variant mt-2 text-center">
        Tes sessions passées apparaîtront ici une fois terminées.
      </Text>
    </View>
  );
}

// ── Écran principal ───────────────────────────────────────────
export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const { activeSession } = useSessionStore();

  // Onglet Matchs : un match par entrée (table session_matches)
  const {
    data: matches,
    isLoading: matchesLoading,
    isError: matchesError,
  } = useMatchHistory();

  // Onglet Sessions : sessions terminées, hors session active en cours
  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
  } = useSessionHistory();

  const sessions = (history ?? []).filter(
    (s) => s.id !== activeSession?.id && (s.status === 'closed' || s.status === 'matched'),
  );

  const isLoading = matchesLoading || historyLoading;
  const isError = matchesError || historyError;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>

      {/* Header */}
      <View className="px-5 py-3">
        <Text className="font-jakarta-extrabold text-xl text-primary">Historique</Text>
      </View>

      {/* Segmented control — rendu même pendant le chargement pour éviter le saut */}
      <SegmentedControl
        active={activeTab}
        matchCount={(matches ?? []).length}
        sessionCount={sessions.length}
        onChange={setActiveTab}
      />

      {/* Contenu */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a63300" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={40} color="#acadac" />
          <Text className="font-jakarta-bold text-base text-on-surface mt-3 text-center">
            Impossible de charger l'historique
          </Text>
        </View>
      ) : activeTab === 'matches' ? (
        (matches ?? []).length === 0 ? (
          <EmptyMatches />
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MatchCard item={item} />}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        sessions.length === 0 ? (
          <EmptySessions />
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SessionRow item={item} />}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

    </SafeAreaView>
  );
}
