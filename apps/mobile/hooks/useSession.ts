import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionStore } from '@/stores/session.store';
import type { Database } from '@swipeat/types';

type SwipeSession = Database['public']['Tables']['sessions']['Row'];

export interface SessionParticipant {
  user_id: string;
  joined_at: string;
  name: string;
}

export interface SessionDetail {
  session: SwipeSession;
  participants: SessionParticipant[];
}

// ── Génère un code à 6 caractères sans ambiguïté visuelle ──
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

// ── Query : détail d'une session + participants ─────────────
async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      session_participants (
        user_id,
        joined_at,
        users ( name )
      )
    `)
    .eq('id', sessionId)
    .single();

  if (error) throw new Error(error.message);

  const participants: SessionParticipant[] = (
    (data.session_participants as Array<{
      user_id: string;
      joined_at: string;
      users: { name: string } | null;
    }>) ?? []
  ).map((p) => ({
    user_id: p.user_id,
    joined_at: p.joined_at,
    name: p.users?.name ?? 'Inconnu',
  }));

  return { session: data as SwipeSession, participants };
}

export function useSessionDetail(sessionId: string | null) {
  return useQuery<SessionDetail, Error>({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSessionDetail(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 5000, // Polling 5s pour détecter les nouveaux participants (avant realtime)
  });
}

// ── Mutation : créer une session ────────────────────────────
export function useCreateSession() {
  const { session } = useAuthStore();
  const { setActiveSession } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation<SwipeSession, Error, void>({
    mutationFn: async (): Promise<SwipeSession> => {
      const userId = session!.user.id;
      const code = generateCode();

      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({ code, owner_id: userId, status: 'waiting', max_participants: 2 })
        .select()
        .single();

      if (sessionError) throw new Error(sessionError.message);

      const { error: participantError } = await supabase
        .from('session_participants')
        .insert({ session_id: newSession.id, user_id: userId });

      if (participantError) throw new Error(participantError.message);

      return newSession as SwipeSession;
    },
    onSuccess: (newSession) => {
      setActiveSession(newSession);
      queryClient.invalidateQueries({ queryKey: ['session', newSession.id] });
    },
  });
}

// ── Mutation : rejoindre une session ────────────────────────
export function useJoinSession() {
  const { session } = useAuthStore();
  const { setActiveSession } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation<SwipeSession, Error, string>({
    mutationFn: async (code: string): Promise<SwipeSession> => {
      const userId = session!.user.id;

      // Trouver la session par code
      const { data: foundSession, error: findError } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('status', 'waiting')
        .single();

      if (findError || !foundSession) {
        throw new Error('Code invalide ou session déjà démarrée.');
      }

      // Rejoindre la session
      const { error: joinError } = await supabase
        .from('session_participants')
        .insert({ session_id: foundSession.id, user_id: userId });

      if (joinError && joinError.code !== '23505') {
        // 23505 = doublon (déjà participant) → on continue sans erreur
        throw new Error(joinError.message);
      }

      // Re-fetch pour obtenir le statut post-trigger (le trigger `on_participant_joined`
      // passe la session en 'active' dès que 2 participants sont insérés).
      const { data: latestSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', foundSession.id)
        .single();

      return (latestSession ?? foundSession) as SwipeSession;
    },
    onSuccess: (joinedSession) => {
      setActiveSession(joinedSession);
      queryClient.invalidateQueries({ queryKey: ['session', joinedSession.id] });
    },
  });
}

// ── Mutation : fermer / quitter une session ─────────────────
export function useCloseSession() {
  const { session } = useAuthStore();
  const { activeSession, setActiveSession, reset } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async (): Promise<void> => {
      if (!activeSession) return;

      const isOwner = activeSession.owner_id === session?.user.id;

      // Si owner : fermer la session
      // La notification aux autres participants arrive via postgres_changes (migration 0004).
      if (isOwner) {
        await supabase
          .from('sessions')
          .update({ status: 'closed' })
          .eq('id', activeSession.id);
      }

      // Supprimer la participation
      await supabase
        .from('session_participants')
        .delete()
        .eq('session_id', activeSession.id)
        .eq('user_id', session!.user.id);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['session', activeSession?.id] });
      setActiveSession(null);
      reset();
    },
  });
}

// ── Mutation : reprendre les swipes après un match ──────────
/**
 * Remet la session en status 'active' pour permettre de nouveaux matchs.
 * Doit être appelé quand l'utilisateur veut continuer à swiper après un match.
 * L'autre participant recevra le changement via postgres_changes et sera
 * automatiquement redirigé vers le deck depuis useSessionRealtime.
 */
export function useResumeSession() {
  const { activeSession, clearMatch } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async (): Promise<void> => {
      if (!activeSession) return;

      const { error } = await supabase
        .from('sessions')
        .update({ status: 'active', match_dish_id: null, matched_at: null })
        .eq('id', activeSession.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      clearMatch();
      queryClient.invalidateQueries({ queryKey: ['session', activeSession?.id] });
    },
  });
}

// ── Restauration de session au démarrage ────────────────────
/**
 * Au montage, si le store n'a pas de session active, interroge Supabase
 * pour retrouver une éventuelle session en cours (waiting/active).
 * Couvre le cas où le store Zustand (in-memory) a été réinitialisé alors
 * que l'utilisateur est encore participant d'une session en DB.
 */
export function useRestoreSession(): void {
  const { session } = useAuthStore();
  const { activeSession, setActiveSession, setSwipedIds } = useSessionStore();

  useEffect(() => {
    if (activeSession || !session?.user.id) return;

    const userId = session.user.id;

    void (async () => {
      // 1. Retrouver la session active/waiting en DB
      const { data } = await supabase
        .from('session_participants')
        .select(`
          joined_at,
          sessions (
            id, code, owner_id, status, max_participants,
            match_dish_id, created_at, matched_at
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (!data) return;

      const found = data
        .flatMap((row) => {
          const s = row.sessions as SwipeSession | null;
          return s ? [s] : [];
        })
        // 'matched' inclus pour restaurer après un match si l'app est relancée
        .find((s) => s.status === 'waiting' || s.status === 'active' || s.status === 'matched');

      if (!found) return;

      setActiveSession(found);

      // 2. Restaurer les dish IDs déjà swipés dans cette session
      //    pour éviter les doublons et masquer les plats déjà vus du deck
      const { data: swipesData } = await supabase
        .from('swipes')
        .select('dish_id')
        .eq('session_id', found.id)
        .eq('user_id', userId);

      if (swipesData && swipesData.length > 0) {
        setSwipedIds(swipesData.map((s) => s.dish_id).filter((id): id is string => id !== null));
      }
    })();
  // Dépendance sur user.id uniquement : on ne veut pas relancer si activeSession change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);
}
