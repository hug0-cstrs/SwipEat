import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionStore } from '@/stores/session.store';
import type { Tables } from '@swipeat/types';

type Dish = Tables<'dishes'>;

/**
 * S'abonne aux changements Realtime de la session active via postgres_changes.
 *
 * Pourquoi postgres_changes plutôt que broadcast ?
 * Le pattern `channel.send()` suivi de `removeChannel()` ne fonctionne pas :
 * le canal est détruit avant que la connexion WebSocket soit établie, donc
 * rien n'est jamais envoyé. postgres_changes écoute directement les mutations
 * en base, sans dépendance au canal WS côté émetteur.
 *
 * - UPDATE sur sessions           → 'active' | 'matched' | 'closed'
 * - INSERT sur session_participants → nouveau participant
 */
export function useSessionRealtime(sessionId: string | null): void {
  const { setMatch, clearMatch, addParticipant, patchActiveSession, setActiveSession, reset } =
    useSessionStore();
  const { session: authSession } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-rt:${sessionId}`)

      // ── Changements de statut de la session ───────────────────────────────
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        async (payload) => {
          const row = payload.new as {
            status: string;
            match_dish_id: string | null;
          };

          // Session (re)passée en active — soit le 2ème participant vient de rejoindre,
          // soit un utilisateur a cliqué "Continuer à swiper" après un match.
          if (row.status === 'active') {
            const prevStatus = useSessionStore.getState().activeSession?.status;
            patchActiveSession({ status: 'active' });
            queryClient.invalidateQueries({ queryKey: ['session', sessionId] });

            // L'autre participant a cliqué "Continuer" → effacer le match et retourner au deck
            if (prevStatus === 'matched') {
              clearMatch();
              router.replace('/(app)');
            }
            return;
          }

          // Match détecté
          if (row.status === 'matched' && row.match_dish_id) {
            // Guard : éviter la double navigation si les deux clients déclenchent en même temps
            if (useSessionStore.getState().matchedDish) return;

            const { data: dish, error } = await supabase
              .from('dishes')
              .select('*')
              .eq('id', row.match_dish_id)
              .single();

            if (error || !dish) {
              console.error(
                '[useSessionRealtime] impossible de charger le plat matché :',
                error?.message,
              );
              return;
            }

            // Marquer la session comme matchée dans le store local pour que
            // le check `prevStatus === 'matched'` fonctionne lors du retour en 'active'.
            patchActiveSession({ status: 'matched' });
            setMatch(dish as Dish);
            queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
            // Invalider l'historique et les matchs pour que le nouveau match apparaisse immédiatement
            queryClient.invalidateQueries({ queryKey: ['session-history', authSession?.user.id] });
            queryClient.invalidateQueries({ queryKey: ['match-history', authSession?.user.id] });
            router.push('/(app)/match');
            return;
          }

          // Session fermée par le owner
          if (row.status === 'closed') {
            setActiveSession(null);
            reset();
            queryClient.removeQueries({ queryKey: ['session', sessionId] });
            queryClient.invalidateQueries({ queryKey: ['session-history', authSession?.user.id] });
            router.replace('/(app)/session');
          }
        },
      )

      // ── Nouveau participant ───────────────────────────────────────────────
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as { user_id: string };

          // Ignorer sa propre insertion (timing variable selon le réseau)
          if (row.user_id === authSession?.user.id) return;

          queryClient.invalidateQueries({ queryKey: ['session', sessionId] });

          // Mise à jour immédiate du store (sans attendre le polling de 5s)
          void supabase
            .from('users')
            .select('name')
            .eq('id', row.user_id)
            .single()
            .then(({ data }) => {
              if (data) addParticipant({ id: row.user_id, name: data.name });
            });
        },
      )

      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error(
            '[useSessionRealtime] Erreur souscription Realtime — vérifier la migration 0004',
          );
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    sessionId,
    authSession?.user.id,
    setMatch,
    clearMatch,
    addParticipant,
    patchActiveSession,
    setActiveSession,
    reset,
    queryClient,
  ]);
}
