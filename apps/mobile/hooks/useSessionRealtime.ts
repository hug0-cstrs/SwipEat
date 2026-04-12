import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useSessionStore } from '@/stores/session.store';

interface MatchPayload {
  dish_id: string;
  dish: Record<string, unknown>;
}

interface UserJoinedPayload {
  user: { id: string; name: string };
}

/**
 * S'abonne au channel Realtime de la session active.
 * - Détecte le match et navigue vers l'écran /match
 * - Met à jour les participants quand quelqu'un rejoint
 * - Gère la fermeture de session par le owner
 */
export function useSessionRealtime(sessionId: string | null): void {
  const { setMatch, addParticipant, patchActiveSession, setActiveSession, reset } = useSessionStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session:${sessionId}`)
      // ── Match détecté ────────────────────────────────────
      .on('broadcast', { event: 'match' }, ({ payload }: { payload: MatchPayload }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMatch(payload.dish as any);
        queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
        router.push('/(app)/match');
      })
      // ── Nouveau participant ───────────────────────────────
      .on('broadcast', { event: 'user_joined' }, ({ payload }: { payload: UserJoinedPayload }) => {
        addParticipant(payload.user);
        // Le second participant vient de rejoindre : la session est maintenant active
        patchActiveSession({ status: 'active' });
        queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      })
      // ── Session fermée par le owner ──────────────────────
      .on('broadcast', { event: 'session_closed' }, () => {
        setActiveSession(null);
        reset();
        queryClient.removeQueries({ queryKey: ['session', sessionId] });
        router.replace('/(app)/session');
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId, setMatch, addParticipant, patchActiveSession, setActiveSession, reset, queryClient]);
}
