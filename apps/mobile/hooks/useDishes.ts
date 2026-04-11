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

/** Mélange un tableau de façon déterministe à partir d'une seed (Fisher-Yates). */
function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
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
 * Variante pour le swipe deck : retourne les plats mélangés de façon
 * stable entre les re-renders (seed = date du jour).
 * Exclut les plats déjà swipés passés en paramètre.
 */
export function useSwipeDeck(
  swipedIds: Set<string>,
  filters?: DishFilters,
) {
  const query = useDishes(filters);

  const deck = (() => {
    if (query.data === undefined) return [];
    const seed = Math.floor(Date.now() / 86_400_000); // change chaque jour
    const shuffled = shuffleWithSeed(query.data, seed);
    return shuffled.filter((d) => !swipedIds.has(d.id));
  })();

  return { ...query, deck };
}
