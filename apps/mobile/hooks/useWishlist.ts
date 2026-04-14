import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionStore } from '@/stores/session.store';
import type { Database } from '@swipeat/types';

type Dish = Database['public']['Tables']['dishes']['Row'];

export interface WishlistEntry {
  dish_id: string;
  added_at: string | null;
  dish: Dish;
}

async function fetchWishlist(userId: string): Promise<WishlistEntry[]> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('dish_id, added_at, dish:dishes(*)')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    dish_id: row.dish_id,
    added_at: row.added_at,
    dish: row.dish as Dish,
  }));
}

export function useWishlist() {
  const { session } = useAuthStore();
  const userId = session?.user.id;

  return useQuery<WishlistEntry[], Error>({
    queryKey: ['wishlist', userId],
    queryFn: () => fetchWishlist(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useRemoveFromWishlist() {
  const { session } = useAuthStore();
  const { activeSession, removeSwipedId } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (dishId: string): Promise<void> => {
      // 1. Supprimer de la wishlist
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', session!.user.id)
        .eq('dish_id', dishId);
      if (error) throw new Error(error.message);

      // 2. Supprimer le swipe correspondant dans la session active
      //    → le plat réapparaîtra dans le deck et pourra être re-swiped
      if (activeSession) {
        await supabase
          .from('swipes')
          .delete()
          .eq('session_id', activeSession.id)
          .eq('user_id', session!.user.id)
          .eq('dish_id', dishId);
        // Pas de throw : best-effort, la wishlist est déjà supprimée
      }
    },
    onSuccess: (_void, dishId) => {
      // Retirer du store swipedIds → le plat réapparaît immédiatement dans le deck
      if (activeSession) {
        removeSwipedId(dishId);
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist', session?.user.id] });
    },
    onError: (error) => {
      console.error('[useRemoveFromWishlist] échec :', error.message);
    },
  });
}
