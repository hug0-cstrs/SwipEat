import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionStore } from '@/stores/session.store';
import { useSwipeDeck, type DishFilters } from './useDishes';
import type { SwipeDirection } from '@/components/dish/SwipeCard';

interface UseSwipeOptions {
  sessionId?: string;
  filters?: DishFilters;
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

  // Alimente la pile quand elle est vide et que les données sont prêtes
  useEffect(() => {
    if (deck.length === 0 && freshDeck.length > 0) {
      setDeck(freshDeck);
    }
  }, [freshDeck, deck.length, setDeck]);

  async function handleSwipe(direction: SwipeDirection): Promise<void> {
    const dish = deck[0];
    if (!dish) return;

    // Avancer la pile immédiatement (optimiste)
    popDeck();
    addSwiped(dish.id);

    // Hors session : pas d'enregistrement DB
    if (!sessionId || !session) return;

    const { error } = await supabase.from('swipes').insert({
      session_id: sessionId,
      dish_id: dish.id,
      direction,
      user_id: session.user.id,
    });

    if (error) {
      console.error('[useSwipe] enregistrement swipe échoué :', error.message);
      return;
    }

    // Vérifier le match uniquement pour les swipes positifs
    if (direction === 'right' || direction === 'up') {
      const { error: fnError } = await supabase.functions.invoke('match-check', {
        body: { session_id: sessionId, dish_id: dish.id },
      });
      if (fnError) {
        console.error('[useSwipe] match-check échoué :', fnError.message);
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
