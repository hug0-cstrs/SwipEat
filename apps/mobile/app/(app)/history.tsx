import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionStore } from '@/stores/session.store';

// ── Types ─────────────────────────────────────────────────────
interface SessionHistoryItem {
  id: string;
  code: string;
  status: string;
  created_at: string;
  matched_at: string | null;
  matchedDishName: string | null;
  matchedDishImage: string | null;
}

// ── Query ─────────────────────────────────────────────────────
async function fetchSessionHistory(userId: string): Promise<SessionHistoryItem[]> {
  // Récupérer les sessions où l'utilisateur a participé (terminées ou matchées)
  const { data, error } = await supabase
    .from('session_participants')
    .select(`
      sessions (
        id,
        code,
        status,
        created_at,
        matched_at,
        dishes:match_dish_id ( name, image_url )
      )
    `)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .flatMap((row) => {
      const s = row.sessions as {
        id: string;
        code: string;
        status: string;
        created_at: string;
        matched_at: string | null;
        dishes: { name: string; image_url: string } | null;
      } | null;

      if (!s) return [];

      return [{
        id: s.id,
        code: s.code,
        status: s.status,
        created_at: s.created_at,
        matched_at: s.matched_at,
        matchedDishName: s.dishes?.name ?? null,
        matchedDishImage: s.dishes?.image_url ?? null,
      }];
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function useSessionHistory(userId: string) {
  return useQuery<SessionHistoryItem[], Error>({
    queryKey: ['session-history', userId],
    queryFn: () => fetchSessionHistory(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

// ── Composant item ────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    matched:  { label: 'Matchée',   bg: '#dcfce7', text: '#15803d' },
    closed:   { label: 'Terminée',  bg: '#fee2e2', text: '#b91c1c' },
    active:   { label: 'Active',    bg: '#dbeafe', text: '#1d4ed8' },
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

function HistoryRow({ item }: { item: SessionHistoryItem }) {
  const date = new Date(item.created_at);
  const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View
      className="bg-surface-container-low rounded-2xl px-4 py-4 mx-5 mb-3"
      style={{ gap: 8 }}
    >
      {/* Ligne 1 : code + statut */}
      <View className="flex-row items-center justify-between">
        <Text className="font-jakarta-extrabold text-base text-on-surface tracking-widest">
          {item.code}
        </Text>
        <StatusBadge status={item.status} />
      </View>

      {/* Ligne 2 : date */}
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
          <Text style={{ fontSize: 18 }}>🍽️</Text>
          <View style={{ flex: 1 }}>
            <Text className="font-jakarta text-xs text-on-surface-variant">Plat matché</Text>
            <Text className="font-jakarta-semibold text-sm text-on-surface" numberOfLines={1}>
              {item.matchedDishName}
            </Text>
          </View>
          <Ionicons name="heart" size={16} color="#22C55E" />
        </View>
      ) : null}
    </View>
  );
}

// ── Écran ─────────────────────────────────────────────────────
export default function HistoryScreen() {
  const { session } = useAuthStore();
  const { activeSession } = useSessionStore();
  const userId = session?.user.id ?? '';
  const { data: history, isLoading, isError } = useSessionHistory(userId);

  // Exclure la session active de l'historique
  const pastSessions = (history ?? []).filter((s) => s.id !== activeSession?.id);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>

      <View className="px-5 py-3">
        <Text className="font-jakarta-extrabold text-xl text-primary">Historique</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="font-jakarta text-sm text-on-surface-variant">Chargement…</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={40} color="#acadac" />
          <Text className="font-jakarta-bold text-base text-on-surface mt-3 text-center">
            Impossible de charger l'historique
          </Text>
        </View>
      ) : pastSessions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text className="font-jakarta-extrabold text-xl text-on-surface mt-4 text-center">
            Aucune session
          </Text>
          <Text className="font-jakarta text-sm text-on-surface-variant mt-2 text-center">
            Tes sessions passées apparaîtront ici une fois terminées.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pastSessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryRow item={item} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

    </SafeAreaView>
  );
}
