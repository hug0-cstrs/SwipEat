import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const { user, session, isInitialized, setSession, setInitialized } = useAuthStore();

  useEffect(() => {
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        // S'assurer que le profil public existe avant d'afficher l'app
        await supabase.from('users').upsert(
          {
            id: session.user.id,
            email: session.user.email ?? '',
            name:
              (session.user.user_metadata?.name as string | undefined) ??
              (session.user.email ?? '').split('@')[0],
          },
          { onConflict: 'id', ignoreDuplicates: true },
        );
      }
      setInitialized();
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, isAuthenticated: !!session, isInitialized };
}
