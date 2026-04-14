import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import type { Database } from '@swipeat/types';

// SecureStore est limité à ~2 048 caractères par clé sur certaines plateformes.
// La session Supabase (JWT + refresh_token + données user) dépasse souvent cette limite.
// Solution : découper les valeurs > CHUNK_SIZE en plusieurs clés suffixées `_N`.
const CHUNK_SIZE = 1900;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    // 1. Essayer d'abord la clé directe (petites valeurs)
    const direct = await SecureStore.getItemAsync(key);
    if (direct !== null) return direct;

    // 2. Essayer la version chunked
    const countStr = await SecureStore.getItemAsync(`${key}_count`);
    if (!countStr) return null;

    const count = parseInt(countStr, 10);
    const chunks: string[] = [];
    for (let i = 0; i < count; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
      if (chunk === null) return null; // Chunk manquant → session corrompue
      chunks.push(chunk);
    }
    return chunks.join('');
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      // Nettoyer d'éventuels anciens chunks avant d'écrire directement
      await ExpoSecureStoreAdapter.removeItem(key);
      await SecureStore.setItemAsync(key, value);
    } else {
      // Supprimer la clé directe si elle existe
      await SecureStore.deleteItemAsync(key).catch(() => undefined);

      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.slice(i, i + CHUNK_SIZE));
      }
      await SecureStore.setItemAsync(`${key}_count`, String(chunks.length));
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_${i}`, chunks[i]!);
      }
    }
  },

  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key).catch(() => undefined);

    // Supprimer les chunks s'ils existent
    const countStr = await SecureStore.getItemAsync(`${key}_count`);
    if (countStr) {
      const count = parseInt(countStr, 10);
      await SecureStore.deleteItemAsync(`${key}_count`).catch(() => undefined);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => undefined);
      }
    }
  },
};

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
