import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionStore } from '@/stores/session.store';
import { useSwipeDeck, type DishFilters } from './useDishes';
import type { SwipeDirection } from '@/components/dish/SwipeCard';

interface UseSwipeOptions {
  sessionId?: string;
  filters?: DishFilters;
}

/** Fisher-Yates shuffle avec Math.random() — ordre différent à chaque initialisation du deck. */
function shuffleDeck<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * Gère la pile de swipe :
 * - Charge les plats depuis Supabase (via useSwipeDeck)
 * - Alimente le Zustand store quand la pile est vide
 * - Enregistre chaque swipe en DB + déclenche match-check si une session est active
 */
export function useSwipe({ sessionId, filters }: UseSwipeOptions = {}) {
  const { deck, swipedIds, setDeck, popDeck, addSwiped } = useSessionStore();
  const { session } = useAuthStore();
  const { deck: freshDeck, isLoading, isError } = useSwipeDeck(swipedIds, filters);
  const queryClient = useQueryClient();

  // Alimente la pile quand elle est vide et que les données sont prêtes.
  // shuffleDeck() applique un ordre aléatoire différent à chaque initialisation.
  useEffect(() => {
    if (deck.length === 0 && freshDeck.length > 0) {
      setDeck(shuffleDeck(freshDeck));
    }
  }, [freshDeck, deck.length, setDeck]);

  async function handleSwipe(direction: SwipeDirection): Promise<void> {
    const dish = deck[0];
    if (!dish) return;

    // Avancer la pile immédiatement (optimiste)
    popDeck();
    addSwiped(dish.id);

    if (!session) return;

    // Sauvegarder dans la wishlist pour tous les likes/superlikes (avec ou sans session)
    if (direction === 'right' || direction === 'up') {
      const { error: wishlistError } = await supabase
        .from('wishlist')
        .upsert(
          { user_id: session.user.id, dish_id: dish.id },
          { onConflict: 'user_id,dish_id', ignoreDuplicates: true },
        );
      if (wishlistError) {
        console.error('[useSwipe] wishlist insert échoué :', wishlistError.message);
      } else {
        queryClient.invalidateQueries({ queryKey: ['wishlist', session.user.id] });
      }
    }

    // Hors session : pas d'enregistrement des swipes ni de match-check
    if (!sessionId) return;

    const { error, data: insertedRows } = await supabase
      .from('swipes')
      .upsert(
        { session_id: sessionId, dish_id: dish.id, direction, user_id: session.user.id },
        { onConflict: 'session_id,user_id,dish_id', ignoreDuplicates: true },
      )
      .select('id');

    if (error) {
      console.error('[useSwipe] enregistrement swipe échoué :', error.message);
      return;
    }

    // Si ignoreDuplicates a absorbé un doublon, pas besoin de re-vérifier le match
    if (!insertedRows || insertedRows.length === 0) return;

    // Vérifier le match uniquement pour les swipes positifs
    if (direction === 'right' || direction === 'up') {
      // Récupérer le JWT frais depuis la session courante.
      // supabase.functions.invoke() ne transmet pas toujours le token automatiquement
      // en v2.46.x → on le passe explicitement pour éviter les erreurs 401 "Invalid JWT".
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      const { error: fnError, data: fnData } = await supabase.functions.invoke('match-check', {
        body: { session_id: sessionId, dish_id: dish.id },
        headers: currentSession?.access_token
          ? { Authorization: `Bearer ${currentSession.access_token}` }
          : undefined,
      });
      if (fnError) {
        // Non-bloquant : le swipe est déjà enregistré, seul le match-check a échoué
        const httpError = fnError as { message: string; status?: number; context?: { text: () => Promise<string> } };
        const body = await httpError.context?.text().catch(() => '');
        console.warn('[useSwipe] match-check échoué :', httpError.status ?? '?', body ?? fnError.message);
      } else if (fnData && typeof fnData === 'object' && 'error' in fnData) {
        console.warn('[useSwipe] match-check erreur :', (fnData as { error: string }).error);
      }
    }
  }

  return {
    deck,
    topCard: deck[0] ?? null,
    /** true uniquement au premier chargement (avant que la pile soit remplie) */
    isLoading: isLoading && deck.length === 0,
    isError,
    handleSwipe,
  };
}
