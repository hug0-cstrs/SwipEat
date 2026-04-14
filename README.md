# SwipEat

> Transformez l'éternel « on mange quoi ce soir ? » en une expérience ludique et partagée.

SwipEat est une application mobile qui transforme le choix du repas en jeu social. Les utilisateurs swipent des plats (droite = j'aime, gauche = je passe, haut = super like). En mode duo, un **match** est détecté en temps réel dès que les deux participants likent le même plat — plus de débats interminables.

---

## Fonctionnalités

- **Deck de swipe** — Parcourez un catalogue de plats avec des animations gestuelles fluides
- **Sessions en duo** — Créez une session, partagez un code à 6 caractères et swipez en synchronisation avec un partenaire
- **Match en temps réel** — Détection instantanée et écran de célébration quand les deux utilisateurs likent le même plat
- **Matchs consécutifs** — Continuez à swiper après un match pour trouver d'autres plats que vous aimez tous les deux
- **Wishlist** — Chaque plat liké est sauvegardé dans votre wishlist personnelle
- **Historique** — Consultez vos sessions passées et les matchs obtenus
- **Profil** — Gérez votre compte et vos préférences

---

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Mobile | Expo SDK | ~54.0.0 |
| Navigation | Expo Router | ~4.0.0 |
| Styling | NativeWind (Tailwind CSS) | ^4.2.0 |
| Animations | React Native Reanimated | ^4.3.0 |
| Gestes | React Native Gesture Handler | ^2.31.0 |
| Backend | Supabase (Auth, DB, Realtime) | ^2.46.0 |
| État serveur | TanStack Query | ^5.0.0 |
| État UI | Zustand | ^5.0.0 |
| Validation | Zod | ^4.0.0 |
| ORM | Drizzle ORM | ^0.36.0 |
| Linter | Biome | ^1.9.0 |
| Monorepo | Turborepo + PNPM workspaces | — |

**Contrainte absolue :** PNPM est le seul gestionnaire de paquets supporté. Ne jamais utiliser `npm` ou `yarn`.

---

## Structure du dépôt

```
SwipEat/
├── apps/
│   └── mobile/                   # Application Expo React Native
│       ├── app/
│       │   ├── _layout.tsx        # Root layout (providers, souscription auth)
│       │   ├── (auth)/            # Écrans non connectés
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   └── (app)/             # Écrans connectés (navigateur à onglets)
│       │       ├── index.tsx      # Deck de swipe (accueil)
│       │       ├── session.tsx    # Écran de session active
│       │       ├── match.tsx      # Écran de célébration du match
│       │       ├── wishlist.tsx   # Plats likés
│       │       ├── history.tsx    # Historique des sessions
│       │       └── profile.tsx    # Profil utilisateur
│       ├── components/
│       │   ├── ui/                # Composants génériques réutilisables
│       │   ├── dish/              # Composants liés aux plats (SwipeCard, DishCard)
│       │   └── session/           # Composants de session (SessionBanner, etc.)
│       ├── hooks/                 # Hooks personnalisés (useSwipe, useSession, useAuth…)
│       ├── stores/                # Stores Zustand (auth, session)
│       └── lib/                   # Client Supabase, QueryClient
├── packages/
│   ├── types/                     # Types TypeScript partagés & schémas Zod
│   ├── db/                        # Schéma Drizzle & utilitaires DB
│   └── config/                    # Configurations TypeScript partagées
├── supabase/
│   ├── functions/
│   │   └── match-check/           # Edge Function — logique de détection de match
│   └── migrations/                # Migrations SQL versionnées
├── CLAUDE.md                      # Instructions pour l'assistant IA
├── turbo.json
├── biome.json
└── pnpm-workspace.yaml
```

---

## Démarrage rapide

### Prérequis

- **Node.js** ≥ 20
- **PNPM** ≥ 9 — `npm install -g pnpm`
- **Expo Go** installé sur votre appareil iOS ou Android
- Un projet [Supabase](https://supabase.com) (le plan gratuit suffit)
- **Supabase CLI** — `npm install -g supabase`

### 1. Cloner et installer

```bash
git clone https://github.com/hug0-cstrs/SwipEat.git
cd SwipEat
pnpm install
```

### 2. Configurer les variables d'environnement

Créez le fichier `apps/mobile/.env.local` :

```env
EXPO_PUBLIC_SUPABASE_URL=https://<votre-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<votre-anon-key>
```

Ces deux valeurs sont disponibles dans votre projet Supabase sous **Settings → API**.

### 3. Appliquer les migrations de base de données

```bash
supabase link --project-ref <votre-project-ref>
supabase db push
```

Cette commande applique toutes les migrations du répertoire `supabase/migrations/` dans l'ordre, en créant les tables, les politiques RLS, les triggers et les souscriptions Realtime.

### 4. Déployer l'Edge Function

```bash
supabase functions deploy match-check --no-verify-jwt
```

### 5. Générer les types TypeScript

```bash
pnpm db:generate
```

Cela régénère `packages/types/supabase.ts` depuis votre schéma Supabase en production.

### 6. Lancer l'application

```bash
# Réseau local standard
pnpm --filter mobile start

# Mode tunnel (WSL2 ou réseau différent)
pnpm --filter mobile start -- --tunnel
```

Scannez le QR code avec Expo Go sur votre appareil.

---

## Schéma de base de données

```
users                → id, email, name, avatar_url, push_token
dishes               → id, name, description, image_url, cuisine_type,
                       prep_time, difficulty, calories, is_vegan, is_gluten_free
sessions             → id, code, owner_id, status, max_participants,
                       match_dish_id, created_at, matched_at
session_participants → session_id, user_id, joined_at
swipes               → id, session_id, user_id, dish_id, direction
wishlist             → user_id, dish_id, added_at
```

### Cycle de vie d'une session

```
waiting  →  active  →  matched  →  (active à nouveau, si les utilisateurs continuent)
                    ↘  closed
```

| Statut | Signification |
|---|---|
| `waiting` | Session créée, en attente du second participant |
| `active` | Les deux participants ont rejoint, swipe en cours |
| `matched` | Un plat a matché — les deux utilisateurs l'ont liké |
| `closed` | Session terminée sans match, ou fermée explicitement |

### Logique de match

Après chaque swipe `right` ou `up`, l'Edge Function `match-check` est appelée. Elle compte les swipes positifs pour ce plat dans la session et les compare au nombre de participants. Si tous les participants ont liké le plat, la session passe en `matched` et tous les clients sont notifiés via Supabase Realtime (`postgres_changes`).

---

## Architecture temps réel

Supabase Realtime remplace tout besoin de serveur WebSocket personnalisé. L'application utilise des souscriptions `postgres_changes` — en écoutant directement les mutations en base de données — plutôt que des broadcasts WebSocket, ce qui évite les problèmes liés à la durée de vie des canaux dans les Edge Functions.

| Événement | Table | Déclencheur |
|---|---|---|
| Session activée | `sessions` | Trigger sur INSERT dans `session_participants` (2ème participant) |
| Match détecté | `sessions` | Edge Function `match-check` met à jour `status = 'matched'` |
| Session fermée | `sessions` | Le owner met à jour `status = 'closed'` |
| Participant rejoint | `session_participants` | Événement INSERT |

---

## Workflow de développement

### Commandes utiles

```bash
# Lancer l'application mobile
pnpm --filter mobile start

# Vérification TypeScript (tous les packages)
pnpm typecheck

# Linting (tous les packages)
pnpm lint

# Régénérer les types Supabase après un changement de schéma
pnpm db:generate

# Appliquer les nouvelles migrations au projet lié
supabase db push

# Déployer l'Edge Function match-check
supabase functions deploy match-check --no-verify-jwt
```

### Avant chaque commit

```bash
pnpm typecheck && pnpm lint
```

### Convention de commits

Ce projet suit [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```
feat: ajouter le retour haptique sur les swipes
fix: empêcher la double navigation lors d'un match simultané
chore: régénérer les types Supabase
refactor: extraire la logique de statut dans useSessionStore
```

---

## Roadmap

### MVP ✅
- Authentification email / mot de passe
- Deck de swipe avec animations Reanimated
- Sessions en duo avec détection de match en temps réel
- Wishlist et historique des matchs
- Écran de profil

### V2 — Planifié
- Filtres avant le swipe (type de cuisine, régime alimentaire, temps de préparation)
- Mode groupe (> 2 participants)
- Suggestions de restaurants via l'API Google Places
- Détail des recettes et génération de liste de courses
- Notifications push

### V3 — Futur
- Recommandations de plats par IA (API Anthropic)
- Génération de recettes par IA
- Fonctionnalités sociales (amis, score de compatibilité)
- Statistiques et gamification
- Abonnement premium

---

## Contribuer

1. Forkez le dépôt
2. Créez une branche : `git checkout -b feat/votre-fonctionnalite`
3. Commitez vos modifications en suivant la convention de commits
4. Ouvrez une pull request

Veillez à exécuter `pnpm typecheck && pnpm lint` avant de soumettre.

---

## Licence

MIT © [hug0-cstrs](https://github.com/hug0-cstrs)
