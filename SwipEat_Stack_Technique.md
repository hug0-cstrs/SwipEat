# SwipEat — Stack technique complète

> **Document de référence pour Claude Code**
> Toujours utiliser les versions listées ici. Ne pas installer de dépendances non listées sans justification explicite.

---

## Contraintes obligatoires

- Package manager : **PNPM** (obligatoire, jamais npm ou yarn)
- Styling : **Tailwind CSS via NativeWind** (obligatoire sur mobile)
- Backend as a Service : **Supabase** (Auth, DB, Realtime, Storage, Edge Functions)
- Monorepo géré par **Turborepo**

---

## Structure du monorepo

```
swipeat/
├── apps/
│   └── mobile/                   # Expo React Native
├── packages/
│   ├── db/                        # Schéma Drizzle + migrations
│   ├── types/                     # Types partagés (Zod schemas)
│   └── config/                    # Configs partagées (tailwind, ts, biome)
├── supabase/
│   ├── functions/                 # Edge Functions Deno
│   └── migrations/                # Fichiers SQL versionnés
├── pnpm-workspace.yaml
├── turbo.json
└── package.json                   # Root — scripts globaux uniquement
```

---

## PNPM — Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// .npmrc
shamefully-hoist=false
strict-peer-dependencies=false
auto-install-peers=true
```

Commandes racine :
```bash
pnpm install                        # Installer toutes les dépendances
pnpm --filter mobile dev            # Lancer l'app mobile
pnpm --filter mobile build          # Build mobile
pnpm db:generate                    # Générer les types Supabase
pnpm db:migrate                     # Appliquer les migrations
pnpm lint                           # Lint tout le monorepo
pnpm typecheck                      # Vérification TypeScript
```

---

## Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".expo/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## TypeScript

```json
// packages/config/tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "skipLibCheck": true
  }
}
```

---

## Biome (remplace ESLint + Prettier)

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  }
}
```

---

## Application mobile — Expo

### Dépendances

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-notifications": "~0.29.0",
    "expo-location": "~18.0.0",
    "expo-sharing": "~12.0.0",
    "react-native": "0.76.x",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-safe-area-context": "~4.12.0",
    "react-native-screens": "~4.1.0",
    "nativewind": "^4.1.0",
    "@gorhom/bottom-sheet": "^5.0.0",
    "react-native-qrcode-svg": "^6.3.0",
    "react-native-view-shot": "^4.0.0",
    "@supabase/supabase-js": "^2.46.0",
    "@tanstack/react-query": "^5.62.0",
    "zustand": "^5.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "@biomejs/biome": "^1.9.0",
    "typescript": "^5.6.0"
  }
}
```

### Configuration NativeWind (Tailwind pour mobile)

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f0',
          500: '#ff6b35',   // Couleur principale SwipEat
          900: '#7c1d0a',
        },
      },
    },
  },
  plugins: [],
};
```

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### Expo Router — Structure de navigation

```
app/
├── _layout.tsx               # Root layout (ThemeProvider, QueryClient, Toasts)
├── (auth)/
│   ├── _layout.tsx           # Layout non connecté
│   ├── login.tsx
│   └── register.tsx
└── (app)/
    ├── _layout.tsx           # Layout connecté (tabs)
    ├── index.tsx             # Onglet Swipe (home)
    ├── session.tsx           # Session active
    ├── match.tsx             # Écran de match
    ├── wishlist.tsx          # Mes plats likés
    ├── history.tsx           # Historique sessions
    └── profile.tsx           # Profil utilisateur
```

Chaque route `(app)` vérifie la session Supabase dans le layout parent. Si non connecté → redirection vers `(auth)/login`.

### Zustand — Stores

```ts
// stores/auth.store.ts
interface AuthStore {
  user: User | null;
  session: Session | null;
  setSession: (session: Session | null) => void;
}

// stores/session.store.ts
interface SessionStore {
  activeSession: SwipeSession | null;
  deck: Dish[];
  swipedIds: Set<string>;
  setActiveSession: (s: SwipeSession | null) => void;
  popDeck: () => Dish | undefined;
  addSwiped: (id: string) => void;
}
```

Ne jamais stocker de données serveur dans Zustand. Zustand = état UI local uniquement. Les données serveur vivent dans TanStack Query.

### TanStack Query — Configuration

```ts
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## Supabase — Configuration complète

### Initialisation client mobile

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import type { Database } from '../types/supabase';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
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
```

### Génération des types TypeScript

```bash
# Après chaque modification du schéma DB
pnpm supabase gen types typescript \
  --project-id $SUPABASE_PROJECT_ID \
  --schema public \
  > packages/types/supabase.ts
```

### Supabase Auth

Utiliser `supabase.auth.signInWithOtp` pour magic link, `signInWithOAuth` pour Google/Apple.

Ne jamais utiliser de JWT custom. Supabase Auth gère entièrement les tokens.

### Supabase Realtime — Sessions de swipe

```ts
// hooks/useSessionRealtime.ts
import { supabase } from '../lib/supabase';

export function useSessionRealtime(sessionId: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on('broadcast', { event: 'swipe' }, ({ payload }) => {
        // Un participant a swipé
      })
      .on('broadcast', { event: 'match' }, ({ payload }) => {
        // Match trouvé → naviguer vers l'écran match
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Mettre à jour la liste des participants connectés
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);
}
```

### Supabase Storage — Images plats

- Bucket `dishes` : public, lectures autorisées sans auth
- Bucket `avatars` : privé, RLS par user_id

```ts
// Uploader une image
const { data, error } = await supabase.storage
  .from('dishes')
  .upload(`${dish.id}.webp`, file, { contentType: 'image/webp', upsert: true });

// URL publique avec transformation (resize CDN Supabase)
const url = supabase.storage
  .from('dishes')
  .getPublicUrl(`${dish.id}.webp`, {
    transform: { width: 600, height: 800, resize: 'cover', format: 'webp' }
  }).data.publicUrl;
```

### Row Level Security (RLS) — Politiques essentielles

```sql
-- Les utilisateurs ne voient que leurs propres swipes
CREATE POLICY "own swipes only" ON swipes
  FOR ALL USING (auth.uid() = user_id);

-- Les participants voient la session à laquelle ils appartiennent
CREATE POLICY "session participants" ON sessions
  FOR SELECT USING (
    id IN (
      SELECT session_id FROM session_participants
      WHERE user_id = auth.uid()
    )
  );

-- Wishlist privée
CREATE POLICY "own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Plats publics (lecture seule)
CREATE POLICY "dishes are public" ON dishes
  FOR SELECT USING (true);
```

---

## Edge Functions Supabase

### Structure

```
supabase/functions/
├── match-check/          # Vérifier si un swipe crée un match
│   └── index.ts
├── generate-recipe/      # Génération IA de recette (V3)
│   └── index.ts
├── send-push/            # Envoi notifications push (V2)
│   └── index.ts
└── nearby-restaurants/   # Recherche Google Places (V2)
    └── index.ts
```

### Exemple — match-check

```ts
// supabase/functions/match-check/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { session_id, dish_id } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Compter les right/up pour ce plat dans cette session
  const { count: voteCount } = await supabase
    .from('swipes')
    .select('*', { count: 'exact' })
    .eq('session_id', session_id)
    .eq('dish_id', dish_id)
    .in('direction', ['right', 'up']);

  const { count: participantCount } = await supabase
    .from('session_participants')
    .select('*', { count: 'exact' })
    .eq('session_id', session_id);

  const isMatch = voteCount === participantCount;

  if (isMatch) {
    await supabase
      .from('sessions')
      .update({ status: 'matched', match_dish_id: dish_id, matched_at: new Date().toISOString() })
      .eq('id', session_id);

    // Broadcast via Realtime
    await supabase.channel(`session:${session_id}`)
      .send({ type: 'broadcast', event: 'match', payload: { dish_id } });
  }

  return new Response(JSON.stringify({ match: isMatch }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## Drizzle ORM

```ts
// packages/db/schema.ts
import { pgTable, uuid, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const dishes = pgTable('dishes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  cuisineType: text('cuisine_type').notNull(),
  prepTime: integer('prep_time'),
  difficulty: text('difficulty', { enum: ['facile', 'moyen', 'difficile'] }),
  calories: integer('calories'),
  isVegan: boolean('is_vegan').default(false),
  isGlutenFree: boolean('is_gluten_free').default(false),
  recipeSteps: jsonb('recipe_steps'),
  ingredients: jsonb('ingredients'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ... autres tables
```

---

## Zod — Schémas partagés

```ts
// packages/types/schemas.ts
import { z } from 'zod';

export const SwipeSchema = z.object({
  session_id: z.string().uuid(),
  dish_id: z.string().uuid(),
  direction: z.enum(['right', 'left', 'up']),
});

export const CreateSessionSchema = z.object({
  max_participants: z.number().int().min(2).max(6).default(2),
  match_mode: z.enum(['majority', 'unanimity']).default('unanimity'),
  filters: z.object({
    cuisine_types: z.array(z.string()).optional(),
    max_prep_time: z.number().optional(),
    vegan_only: z.boolean().optional(),
    gluten_free_only: z.boolean().optional(),
  }).optional(),
});

export type Swipe = z.infer<typeof SwipeSchema>;
export type CreateSession = z.infer<typeof CreateSessionSchema>;
```

---

## Upstash Redis (rate limiting)

```ts
// Utilisé dans les Edge Functions pour protéger les endpoints sensibles
import { Redis } from 'https://esm.sh/@upstash/redis';
import { Ratelimit } from 'https://esm.sh/@upstash/ratelimit';

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_TOKEN')!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),  // 10 req / 10s par IP
});
```

---

## Variables d'environnement complètes

```env
# Mobile (.env.local dans apps/mobile/)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase Edge Functions (Dashboard → Settings → Edge Functions)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_PLACES_API_KEY=AIza...
EXPO_ACCESS_TOKEN=...
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...
```

---

## CI/CD — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm --filter db test

  eas-build:
    needs: check
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: ${{ secrets.EXPO_TOKEN }} }
      - run: pnpm install --frozen-lockfile
      - run: eas update --auto              # OTA update sur la branche main
```

---

## Déploiement

### Mobile
- Développement : Expo Go + `pnpm --filter mobile start`
- Preview builds : `eas build --profile preview`
- Production iOS : `eas build --platform ios --profile production` → App Store Connect
- Production Android : `eas build --platform android --profile production` → Google Play Console
- Mises à jour JS (OTA) : `eas update --branch production` (sans passer par les stores)

### Supabase
- Local : `supabase start` (Docker requis)
- Migrations : `supabase db push` (staging) → `supabase db push --db-url $PROD_DB_URL` (prod)
- Edge Functions : `supabase functions deploy match-check`

---

## Scalabilité — Points d'attention

Supabase gère la scalabilité de la base de données et du Realtime nativement. Les points à surveiller avec la croissance :

- **Realtime** : chaque session crée un channel. Supabase supporte des milliers de channels simultanés sur les plans payants.
- **Edge Functions** : stateless par nature, scalent automatiquement.
- **Storage CDN** : les images de plats sont servies via CDN global Supabase sans configuration.
- **Rate limiting** : Upstash Redis protège les Edge Functions sensibles dès le MVP.
- **Index DB** : créer des index sur `swipes(session_id)`, `sessions(code)` et `session_participants(session_id)` dès le départ.
- **Connection pooling** : activer Supabase Pooler (PgBouncer intégré) en production pour gérer les pics de connexions.

---

## Ce qu'on n'utilise PAS et pourquoi

| Technologie | Raison d'exclusion |
|-------------|-------------------|
| npm / yarn | PNPM imposé — meilleure gestion des dépendances en monorepo |
| Redux | Trop verbeux — Zustand + TanStack Query couvre tous les cas |
| Socket.io custom | Supabase Realtime remplace entièrement le besoin |
| Express / Fastify | Supabase Edge Functions suffisent — pas de serveur Node à maintenir |
| Prisma | Drizzle est plus léger, plus rapide et génère du SQL lisible |
| ESLint + Prettier | Biome les remplace avec de meilleures performances |
| Firebase | Supabase est open-source, SQL, et évite le vendor lock-in |
