# CLAUDE.md — SwipEat

> Ce fichier est le document de référence principal pour Claude Code.
> Lire ce fichier intégralement avant de commencer à coder.
> En cas de doute sur une décision technique, ce fichier fait autorité.

---

## 1. VUE D'ENSEMBLE DU PROJET

SwipEat est une application mobile qui transforme le choix du repas en expérience ludique et sociale. Les utilisateurs swipent des plats (droite = j'aime, gauche = passe, haut = super like). En mode duo ou groupe, un "match" est détecté en temps réel quand tous les participants aiment le même plat.

### Roadmap
- **MVP** → swipe solo + session duo temps réel + wishlist
- **V2** → filtres, mode groupe, restaurants Google Places, recettes, notifications push
- **V3** → recommandations IA, génération recette IA, amis, stats, premium

### Documents de référence
- `docs/SwipEat_MVP.md` — spec fonctionnelle MVP complète
- `docs/SwipEat_V2.md` — spec fonctionnelle V2
- `docs/SwipEat_V3.md` — spec fonctionnelle V3
- `docs/SwipEat_Stack_Technique.md` — stack technique détaillée

---

## 2. STACK TECHNIQUE

### Contraintes obligatoires — ne jamais déroger
- **Package manager** : PNPM exclusivement. Jamais npm, jamais yarn.
- **Styling** : NativeWind v4 (Tailwind CSS pour React Native). Jamais StyleSheet.create sauf cas impossible avec NativeWind.
- **Backend** : Supabase exclusivement (Auth, DB, Realtime, Storage, Edge Functions).
- **Monorepo** : Turborepo + PNPM workspaces.

### Stack complète

| Couche | Technologie | Version |
|--------|-------------|---------|
| Mobile | Expo SDK | ~54.0.0 |
| Navigation | Expo Router | ~4.0.0 |
| Styling | NativeWind | ^4.2.0 |
| Tailwind | tailwindcss | ^3.4.0 (v3, pas v4) |
| Animations | React Native Reanimated | ^4.3.0 |
| Gestes | React Native Gesture Handler | ^2.31.0 |
| Auth + DB + RT | Supabase JS | ^2.46.0 |
| State serveur | TanStack Query | ^5.0.0 |
| State UI | Zustand | ^5.0.0 |
| Validation | Zod | ^4.0.0 |
| ORM | Drizzle ORM | ^0.36.0 |
| Linter/Formatter | Biome | ^1.9.0 |
| TypeScript | TypeScript | ^5.6.0 |

### Packages workspace internes
- `@swipeat/config` → configs TypeScript partagées
- `@swipeat/types` → types et schémas Zod partagés
- `@swipeat/db` → schéma Drizzle + utilitaires DB

---

## 3. STRUCTURE DU PROJET

```
SwipEat/
├── CLAUDE.md                          ← CE FICHIER
├── docs/                              ← Specs fonctionnelles
├── apps/
│   └── mobile/                        ← Application Expo React Native
│       ├── app/
│       │   ├── _layout.tsx            ← Root layout (providers)
│       │   ├── (auth)/
│       │   │   ├── _layout.tsx
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   └── (app)/
│       │       ├── _layout.tsx        ← Tab navigator
│       │       ├── index.tsx          ← Swipe deck (home)
│       │       ├── session.tsx        ← Session active
│       │       ├── match.tsx          ← Écran de match
│       │       ├── wishlist.tsx       ← Mes plats likés
│       │       ├── history.tsx        ← Historique sessions
│       │       └── profile.tsx        ← Profil utilisateur
│       ├── components/
│       │   ├── ui/                    ← Composants génériques réutilisables
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Avatar.tsx
│       │   │   ├── Badge.tsx
│       │   │   └── Card.tsx
│       │   ├── dish/                  ← Composants liés aux plats
│       │   │   ├── SwipeCard.tsx
│       │   │   ├── DishCard.tsx
│       │   │   └── DishDetail.tsx
│       │   └── session/               ← Composants liés aux sessions
│       │       ├── SessionBanner.tsx
│       │       ├── ParticipantsList.tsx
│       │       └── MatchModal.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useSwipe.ts
│       │   ├── useSession.ts
│       │   └── useSessionRealtime.ts
│       ├── stores/
│       │   ├── auth.store.ts
│       │   └── session.store.ts
│       ├── lib/
│       │   ├── supabase.ts
│       │   └── query-client.ts
│       ├── constants/
│       │   └── colors.ts
│       ├── tailwind.config.js
│       ├── babel.config.js
│       ├── metro.config.js
│       └── global.css
├── packages/
│   ├── config/
│   │   └── tsconfig.base.json
│   ├── types/
│   │   ├── schemas.ts
│   │   ├── supabase.ts               ← Généré automatiquement (pnpm db:generate)
│   │   └── index.ts
│   └── db/
│       ├── schema.ts
│       └── index.ts
├── supabase/
│   ├── functions/                     ← Edge Functions Deno
│   │   └── match-check/
│   │       └── index.ts
│   └── migrations/                    ← SQL versionné
│       └── 0001_initial_schema.sql
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
└── package.json
```

---

## 4. RÈGLES DE CODE — IMPÉRATIVES

### 4.1 TypeScript
- **Strict mode obligatoire**. Zéro `any`. Zéro `@ts-ignore`.
- Toujours typer les props des composants avec une interface nommée.
- Utiliser les types générés par Supabase depuis `@swipeat/types/supabase`.
- Préférer `type` à `interface` pour les unions et intersections.
- Toujours typer les retours de fonctions async.

```typescript
// ✅ Correct
async function getSession(id: string): Promise<Session | null> { ... }

// ❌ Interdit
async function getSession(id) { ... }
```

### 4.2 Composants React Native
- **NativeWind uniquement** pour le styling. Pas de `StyleSheet.create`.
- Toujours utiliser `SafeAreaView` ou `useSafeAreaInsets` pour les écrans.
- Nommer les composants en PascalCase, les fichiers en PascalCase.tsx.
- Un composant = un fichier. Pas de composants définis inline sauf très petits helpers locaux.
- Toujours exporter en `export default` pour les écrans Expo Router.
- Toujours exporter en `export function` pour les composants réutilisables.

```tsx
// ✅ Correct — composant réutilisable
export function DishCard({ dish, onSwipe }: DishCardProps) {
  return (
    <View className="rounded-3xl overflow-hidden bg-white shadow-lg">
      ...
    </View>
  );
}

// ❌ Interdit
const DishCard = ({ dish, onSwipe }) => {
  return (
    <View style={{ borderRadius: 24, overflow: 'hidden' }}>
      ...
    </View>
  );
}
```

### 4.3 Gestion de l'état
- **TanStack Query** pour toutes les données venant du serveur (plats, sessions, profil).
- **Zustand** pour l'état UI local uniquement (session active en cours, deck de cartes).
- Ne jamais stocker dans Zustand des données qui viennent de l'API.
- Ne jamais appeler Supabase directement dans un composant — toujours via un hook ou une query function.

```typescript
// ✅ Correct — données serveur dans TanStack Query
function useDishes(filters?: DishFilters) {
  return useQuery({
    queryKey: ['dishes', filters],
    queryFn: () => fetchDishes(filters),
  });
}

// ❌ Interdit — appel direct dans un composant
function HomeScreen() {
  const [dishes, setDishes] = useState([]);
  useEffect(() => {
    supabase.from('dishes').select('*').then(({ data }) => setDishes(data));
  }, []);
}
```

### 4.4 Supabase
- Toujours utiliser le client Supabase depuis `lib/supabase.ts`. Ne jamais recréer le client.
- Toujours gérer les erreurs Supabase : vérifier `error` avant d'utiliser `data`.
- Utiliser les types générés : `supabase.from('dishes')` doit être typé via `Database`.
- Les tokens sont stockés dans `expo-secure-store`. Jamais dans `AsyncStorage`.
- Les Edge Functions sont appelées via `supabase.functions.invoke()`.

```typescript
// ✅ Correct
const { data, error } = await supabase.from('dishes').select('*');
if (error) throw new Error(error.message);
return data;

// ❌ Interdit
const { data } = await supabase.from('dishes').select('*');
return data; // error ignorée
```

### 4.5 Gestion des erreurs
- Toujours wrapper les appels async dans try/catch dans les mutations TanStack Query.
- Afficher des messages d'erreur utiles à l'utilisateur — jamais de messages techniques bruts.
- Logger les erreurs en développement avec `console.error`, jamais en production (utiliser Sentry en V3).

### 4.6 Nommage
- Composants : `PascalCase` (ex: `SwipeCard`, `MatchModal`)
- Hooks : `camelCase` préfixé par `use` (ex: `useSession`, `useSwipe`)
- Stores : `camelCase` suffixé par `Store` (ex: `authStore`, `sessionStore`)
- Fonctions utilitaires : `camelCase` (ex: `generateSessionCode`, `computeMatchScore`)
- Constantes : `SCREAMING_SNAKE_CASE` (ex: `MAX_PARTICIPANTS`, `SWIPE_THRESHOLD`)
- Types/Interfaces : `PascalCase` (ex: `Dish`, `SwipeSession`, `UserProfile`)
- Fichiers de composants : `PascalCase.tsx`
- Fichiers de hooks/utils : `camelCase.ts`

### 4.7 Imports
- Utiliser les alias de chemin `@/` pour les imports internes à `apps/mobile`.
- Les packages workspace s'importent via leur nom (`@swipeat/types`).
- Grouper les imports : 1) React/RN, 2) librairies externes, 3) packages workspace, 4) imports locaux.

```typescript
// ✅ Correct — ordre d'imports
import { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';

import { useQuery } from '@tanstack/react-query';
import Animated, { useSharedValue } from 'react-native-reanimated';

import type { Dish } from '@swipeat/types';

import { supabase } from '@/lib/supabase';
import { DishCard } from '@/components/dish/DishCard';
```

---

## 5. DESIGN SYSTEM — TAILWIND

### Couleurs de marque à utiliser dans NativeWind

```javascript
// tailwind.config.js — couleurs disponibles
colors: {
  brand: {
    50: '#fff5f0',
    100: '#ffe8dc',
    500: '#FF6B35',   // Couleur principale — CTA, actif
    600: '#E55A28',   // Pressed, dark
    900: '#7c1d0a',
  },
  like: '#22C55E',      // Swipe droite
  pass: '#EF4444',      // Swipe gauche
  superlike: '#F59E0B', // Swipe haut
}
```

### Classes NativeWind les plus utilisées

```tsx
// Bouton primaire
<Pressable className="bg-brand-500 rounded-full px-6 py-4 items-center active:bg-brand-600">

// Card de plat
<View className="rounded-3xl overflow-hidden bg-white shadow-md">

// Input
<TextInput className="h-13 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-base">

// Badge/Chip
<View className="bg-brand-50 rounded-full px-3 py-1">
  <Text className="text-brand-600 text-xs font-semibold">

// Bottom tab active
<View className="items-center">
  <Icon color="#FF6B35" size={24} />
  <View className="w-1 h-1 rounded-full bg-brand-500 mt-1" />
</View>
```

---

## 6. BASE DE DONNÉES

### Schéma (référence rapide)

```
users           → id, email, name, avatar_url, push_token
dishes          → id, name, description, image_url, cuisine_type, prep_time, difficulty, calories, is_vegan, is_gluten_free, recipe_steps, ingredients
sessions        → id, code, owner_id, status, max_participants, match_dish_id, created_at, matched_at
session_participants → session_id, user_id, joined_at
swipes          → id, session_id, user_id, dish_id, direction ('right'|'left'|'up')
wishlist        → user_id, dish_id, added_at
```

### Statuts d'une session
```
'waiting'  → créée, en attente de participants
'active'   → tous les participants ont rejoint, swipe en cours
'matched'  → un plat a matché
'closed'   → session terminée sans match
```

### Logique de match
Après chaque swipe `right` ou `up` : vérifier si tous les participants de la session ont swipé `right` ou `up` sur ce plat. Si oui → match. Cette logique vit dans l'Edge Function `match-check`, jamais côté client.

### RLS — Politiques actives
- `dishes` : lecture publique, pas d'écriture client
- `swipes` : lecture/écriture uniquement pour `auth.uid() = user_id`
- `wishlist` : lecture/écriture uniquement pour `auth.uid() = user_id`
- `sessions` : lecture pour les participants uniquement
- `session_participants` : lecture pour les participants de la session

---

## 7. REALTIME — WEBSOCKETS

### Architecture
Supabase Realtime remplace Socket.io. Chaque session crée un channel `session:{session_id}`.

### Événements broadcast (server → clients)

| Événement | Payload | Déclencheur |
|-----------|---------|-------------|
| `swipe` | `{ user_id, dish_id }` | Après chaque swipe enregistré |
| `match` | `{ dish_id, dish: {...} }` | Quand match-check détecte un match |
| `user_joined` | `{ user: { id, name } }` | Quand un participant rejoint |
| `session_closed` | `{}` | Quand la session se ferme |

### Implémentation dans le hook

```typescript
// hooks/useSessionRealtime.ts
export function useSessionRealtime(sessionId: string) {
  const { setMatch, addParticipant } = useSessionStore();

  useEffect(() => {
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on('broadcast', { event: 'match' }, ({ payload }) => {
        setMatch(payload.dish);
        router.push('/match');
      })
      .on('broadcast', { event: 'user_joined' }, ({ payload }) => {
        addParticipant(payload.user);
      })
      .on('presence', { event: 'sync' }, () => {
        // Mettre à jour les participants connectés
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);
}
```

---

## 8. EDGE FUNCTIONS

### Localisation
`supabase/functions/{nom-de-la-fonction}/index.ts`

### Pattern standard

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    // ... logique métier

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### Déploiement
```bash
supabase functions deploy match-check
```

---

## 9. AUTHENTIFICATION

### Flux complet
1. Utilisateur saisit email + password (ou Google/Apple OAuth)
2. `supabase.auth.signInWithPassword()` retourne session + JWT
3. Le JWT est stocké automatiquement dans `expo-secure-store` via l'adapter custom
4. `supabase.auth.onAuthStateChange()` écoute les changements dans le root layout
5. Expo Router redirige vers `(auth)` si pas de session, `(app)` si connecté

### Hook d'auth

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { user, session, setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, isAuthenticated: !!session };
}
```

### Protection des routes
Dans `app/(app)/_layout.tsx` :
```typescript
const { isAuthenticated } = useAuth();
if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
```

---

## 10. VARIABLES D'ENVIRONNEMENT

### Mobile (`apps/mobile/.env.local`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Edge Functions (Dashboard → Settings → Secrets)
```
ANTHROPIC_API_KEY=sk-ant-...        ← V3 uniquement
GOOGLE_PLACES_API_KEY=AIza...       ← V2 uniquement
EXPO_ACCESS_TOKEN=...               ← V2 uniquement
```

### Règles
- Toutes les variables exposées au client DOIVENT être préfixées `EXPO_PUBLIC_`.
- Ne jamais commettre de fichier `.env` ou `.env.local` dans git.
- Le fichier `.gitignore` doit contenir `*.env*`.

---

## 11. COMMANDES UTILES

```bash
# Développement
pnpm --filter mobile start          # Lancer l'app Expo
pnpm --filter mobile start -- --tunnel  # Mode tunnel (WSL2/réseau)

# Base de données
supabase db push                    # Appliquer les migrations
pnpm db:generate                    # Générer les types TypeScript depuis Supabase
supabase functions deploy <nom>     # Déployer une Edge Function

# Qualité du code
pnpm typecheck                      # Vérification TypeScript (tous les packages)
pnpm lint                           # Linting Biome (tous les packages)
pnpm --filter mobile typecheck      # TypeScript sur mobile uniquement

# Monorepo
pnpm install                        # Toujours depuis la racine
pnpm ls -r --depth -1               # Voir tous les packages workspace
```

---

## 12. WORKFLOW DE DÉVELOPPEMENT

### Ordre d'implémentation recommandé pour le MVP

1. **Supabase** → vérifier que la migration est appliquée et les types générés
2. **Auth** → `lib/supabase.ts` → `hooks/useAuth.ts` → écrans login/register
3. **Navigation** → root layout + tab layout + protection des routes
4. **Plats** → seed de la DB → query `useDishes` → composant `DishCard`
5. **Swipe** → `SwipeCard.tsx` avec Reanimated → `useSwipe.ts` → enregistrement en DB
6. **Sessions** → création de session → code de partage → rejoindre une session
7. **Realtime** → `useSessionRealtime.ts` → détection du match
8. **Match screen** → animation de célébration → navigation post-match
9. **Wishlist** → query wishlist → grille de plats likés

### Avant chaque commit
```bash
pnpm typecheck && pnpm lint
```

### Convention de commits (Conventional Commits)
```
feat: ajouter le composant SwipeCard
fix: corriger la logique de match en session duo
chore: mettre à jour les types Supabase
refactor: extraire useSwipe depuis HomeScreen
docs: mettre à jour CLAUDE.md
```

---

## 13. CE QUI EST HORS SCOPE (NE PAS IMPLÉMENTER)

### Pour le MVP — attendre V2
- Filtres avant le swipe
- Mode groupe (> 2 participants)
- Restaurants Google Places
- Génération de recettes / liste de courses
- Notifications push
- Bouton Undo
- Statistiques
- Partage social

### Pour le MVP et V2 — attendre V3
- Recommandations IA (Anthropic API)
- Génération recette par IA
- Système d'amis
- Score de compatibilité
- Abonnement premium
- Gamification / badges

---

## 14. PIÈGES À ÉVITER

| Piège | Solution |
|-------|----------|
| Installer tailwindcss v4 | Toujours `tailwindcss@^3.4.0` — NativeWind v4 exige Tailwind v3 |
| Utiliser `npm` ou `yarn` | PNPM uniquement, toujours depuis la racine |
| Ajouter un package workspace avec `pnpm add` | Éditer le `package.json` manuellement + `pnpm install` depuis la racine |
| Stocker le JWT dans AsyncStorage | Utiliser `expo-secure-store` via l'adapter Supabase |
| Appeler Supabase dans un composant | Toujours via un hook custom ou une query function |
| Logique de match côté client | La logique de match vit dans l'Edge Function `match-check` |
| Créer le client Supabase plusieurs fois | Toujours importer depuis `@/lib/supabase` |
| Utiliser `StyleSheet.create` | NativeWind className uniquement |
| `pipeline` dans turbo.json | Utiliser `tasks` (Turborepo v2+) |
| `pnpm add @swipeat/xxx` sans `workspace:*` | Utiliser `@swipeat/xxx@workspace:*` |

---

## 15. RESSOURCES

- Supabase Docs : https://supabase.com/docs
- Expo Router Docs : https://docs.expo.dev/router/introduction
- NativeWind Docs : https://www.nativewind.dev
- TanStack Query Docs : https://tanstack.com/query/latest
- Reanimated Docs : https://docs.swmansion.com/react-native-reanimated
- Zod Docs : https://zod.dev
- Drizzle Docs : https://orm.drizzle.team