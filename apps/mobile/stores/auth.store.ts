import { create } from 'zustand';

import type { Session, User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isInitialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitialized: () => set({ isInitialized: true }),
}));
