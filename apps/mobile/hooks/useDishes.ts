import { useQuery } from '@tanstack/react-query';

import type { Database } from '@swipeat/types';
import { supabase } from '@/lib/supabase';

type Dish = Database['public']['Tables']['dishes']['Row'];

export interface DishFilters {
  cuisineType?: string;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  difficulty?: 'facile' | 'moyen' | 'difficile';
}

async function fetchDishes(filters?: DishFilters): Promise<Dish[]> {
  let query = supabase.from('dishes').select('*');

  if (filters?.cuisineType !== undefined) {
    query = query.eq('cuisine_type', filters.cuisineType);
  }
  if (filters?.isVegan === true) {
    query = query.eq('is_vegan', true);
  }
  if (filters?.isGlutenFree === true) {
    query = query.eq('is_gluten_free', true);
  }
  if (filters?.difficulty !== undefined) {
    query = query.eq('difficulty', filters.difficulty);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Retourne tous les plats correspondant aux filtres optionnels.
 * Les données sont mises en cache par TanStack Query.
 */
export function useDishes(filters?: DishFilters) {
  return useQuery<Dish[], Error>({
    queryKey: ['dishes', filters ?? null],
    queryFn: () => fetchDishes(filters),
    staleTime: 5 * 60 * 1000, // 5 min — les plats changent rarement
  });
}

/**
 * Variante pour le swipe deck : retourne les plats filtrés (exclut les déjà swipés).
 * Le mélange aléatoire est délégué à useSwipe pour n'être appliqué qu'une seule fois
 * au moment où la pile est initialisée.
 */
export function useSwipeDeck(
  swipedIds: Set<string>,
  filters?: DishFilters,
) {
  const query = useDishes(filters);

  const deck = query.data === undefined
    ? []
    : query.data.filter((d) => !swipedIds.has(d.id));

  return { ...query, deck };
}
