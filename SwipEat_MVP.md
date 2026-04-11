# SwipEat — Spécification MVP

> **Document de référence pour Claude Code**
> Version : MVP (lancement)
> Stack : React Native (Expo) · Node.js · PostgreSQL · Socket.io
> Objectif : Valider le concept avec le strict minimum fonctionnel

---

## Vue d'ensemble du MVP

Le MVP couvre quatre piliers fondamentaux :
1. Authentification utilisateur
2. Swipe de plats (solo)
3. Session partagée en temps réel (duo)
4. Wishlist et résultat du match

Tout le reste est hors scope. Ne pas implémenter de fonctionnalités non listées ici.

---

## Architecture technique

```
swipeat/
├── apps/
│   └── mobile/               # React Native (Expo SDK 51+)
│       ├── app/              # Expo Router (file-based routing)
│       │   ├── (auth)/       # Écrans non connectés
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   ├── (app)/        # Écrans connectés
│       │   │   ├── index.tsx         # Deck de swipe (home)
│       │   │   ├── session.tsx       # Mode duo / session active
│       │   │   ├── match.tsx         # Écran de match
│       │   │   └── wishlist.tsx      # Mes plats likés
│       │   └── _layout.tsx
│       ├── components/
│       │   ├── SwipeCard.tsx
│       │   ├── DishCard.tsx
│       │   └── MatchModal.tsx
│       ├── hooks/
│       │   ├── useSwipe.ts
│       │   └── useSession.ts
│       └── services/
│           ├── api.ts         # Appels REST vers le backend
│           └── socket.ts      # Connexion Socket.io
│
└── apps/
    └── api/                  # Node.js + Fastify
        ├── src/
        │   ├── routes/
        │   │   ├── auth.ts
        │   │   ├── dishes.ts
        │   │   ├── sessions.ts
        │   │   └── swipes.ts
        │   ├── sockets/
        │   │   └── session.socket.ts
        │   ├── db/
        │   │   ├── schema.sql
        │   │   └── index.ts   # Client PostgreSQL (pg)
        │   └── index.ts       # Point d'entrée Fastify
        └── package.json
```

---

## Base de données — Schéma SQL complet

```sql
-- Utilisateurs
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,             -- bcrypt hash
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Plats (catalogue statique pour le MVP)
CREATE TABLE dishes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT NOT NULL,
  cuisine_type  TEXT NOT NULL,           -- 'italien', 'asiatique', 'français'…
  prep_time     INT,                     -- en minutes
  difficulty    TEXT CHECK (difficulty IN ('facile','moyen','difficile')),
  calories      INT,
  is_vegan      BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions de swipe
CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,      -- code 6 caractères pour rejoindre
  owner_id    UUID REFERENCES users(id),
  status      TEXT DEFAULT 'waiting'     -- 'waiting' | 'active' | 'matched' | 'closed'
              CHECK (status IN ('waiting','active','matched','closed')),
  match_dish_id UUID REFERENCES dishes(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  matched_at  TIMESTAMPTZ
);

-- Participants d'une session
CREATE TABLE session_participants (
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

-- Swipes
CREATE TABLE swipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  dish_id     UUID REFERENCES dishes(id),
  direction   TEXT CHECK (direction IN ('right','left','up')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, user_id, dish_id)
);

-- Wishlist (plats likés hors session)
CREATE TABLE wishlist (
  user_id     UUID REFERENCES users(id),
  dish_id     UUID REFERENCES dishes(id),
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, dish_id)
);

-- Index utiles
CREATE INDEX idx_swipes_session ON swipes(session_id);
CREATE INDEX idx_swipes_user ON swipes(user_id);
CREATE INDEX idx_sessions_code ON sessions(code);
```

---

## API REST — Endpoints

### Auth

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Connexion → retourne JWT |
| GET | `/auth/me` | Profil connecté (bearer token) |

**POST /auth/register**
```json
// Body
{ "email": "...", "password": "...", "name": "..." }

// Response 201
{ "token": "jwt...", "user": { "id": "...", "name": "...", "email": "..." } }
```

**POST /auth/login**
```json
// Body
{ "email": "...", "password": "..." }

// Response 200
{ "token": "jwt...", "user": { "id": "...", "name": "...", "email": "..." } }
```

---

### Plats

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/dishes` | Liste paginée des plats |
| GET | `/dishes/:id` | Détail d'un plat |

**GET /dishes**
```
Query params : page (défaut 1), limit (défaut 20)
```
```json
// Response 200
{
  "dishes": [
    {
      "id": "...",
      "name": "Risotto aux champignons",
      "description": "...",
      "image_url": "...",
      "cuisine_type": "italien",
      "prep_time": 35,
      "difficulty": "moyen",
      "calories": 480,
      "is_vegan": true,
      "is_gluten_free": false
    }
  ],
  "total": 120,
  "page": 1
}
```

---

### Sessions

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/sessions` | Créer une session → génère un code |
| POST | `/sessions/join` | Rejoindre via code |
| GET | `/sessions/:id` | État de la session |
| GET | `/sessions/:id/dishes` | Deck de plats de la session |

**POST /sessions**
```json
// Response 201
{ "session": { "id": "...", "code": "XK92PL", "status": "waiting" } }
```

**POST /sessions/join**
```json
// Body
{ "code": "XK92PL" }

// Response 200
{ "session": { "id": "...", "code": "XK92PL", "status": "active" } }
```

---

### Swipes

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/swipes` | Enregistrer un swipe |

**POST /swipes**
```json
// Body
{
  "session_id": "...",
  "dish_id": "...",
  "direction": "right"   // "right" | "left" | "up"
}

// Response 201
{
  "swipe": { "id": "..." },
  "match": null           // ou { "dish_id": "...", "dish": { ... } } si match détecté
}
```

**Logique de match côté serveur :**
Après chaque swipe `right` ou `up`, vérifier si tous les participants de la session ont swipé `right` ou `up` sur ce même plat. Si oui → mettre à jour `sessions.status = 'matched'` et `sessions.match_dish_id`, puis émettre l'événement Socket.io `match`.

---

### Wishlist

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/wishlist` | Mes plats likés |
| POST | `/wishlist/:dish_id` | Ajouter un plat |
| DELETE | `/wishlist/:dish_id` | Retirer un plat |

---

## WebSocket — Événements Socket.io

La room Socket.io correspond au `session_id`.

### Côté client → serveur

| Événement | Payload | Description |
|-----------|---------|-------------|
| `join_session` | `{ session_id, user_id, token }` | Rejoindre la room |
| `swipe` | `{ session_id, dish_id, direction }` | Envoyer un swipe |

### Côté serveur → client

| Événement | Payload | Description |
|-----------|---------|-------------|
| `user_joined` | `{ user: { id, name } }` | Un participant a rejoint |
| `user_swiped` | `{ user_id, dish_id }` | Notification de swipe (sans direction) |
| `match` | `{ dish: { id, name, image_url, ... } }` | Match trouvé |
| `session_closed` | `{}` | Session terminée |

---

## Composants React Native

### SwipeCard.tsx

Utiliser la librairie `react-native-gesture-handler` + `react-native-reanimated` pour les animations.

```tsx
// Comportement attendu :
// - Swipe droite  (> 80px) → direction "right" → bordure verte
// - Swipe gauche  (< -80px) → direction "left"  → bordure rouge
// - Swipe haut    (> 80px vertical) → direction "up" → bordure dorée (super like)
// - Relâchement sans seuil → retour en place (spring animation)
// - Après confirmation → la carte part hors écran (fly-out animation 300ms)
// - Props : dish, onSwipe(direction), style
```

### DishCard.tsx

Contenu affiché sur chaque carte :
- Photo plein écran (Image avec `resizeMode="cover"`)
- Dégradé bas → haut sur la photo pour la lisibilité du texte
- Nom du plat (24px bold)
- Type de cuisine + temps de préparation (badges)
- Indicateur difficulté (points colorés)
- Calories (optionnel, petite police)

### MatchModal.tsx

- Animation d'entrée : scale + fade (spring)
- Afficher la photo du plat matchée
- Texte : "C'est le match du soir !"
- Bouton "Voir la recette" → naviguer vers le détail du plat
- Bouton "Nouvelle session" → réinitialiser

---

## Données de seed — Catalogue initial

Insérer au minimum 50 plats dans la base couvrant ces catégories :
- Cuisine française (10 plats)
- Cuisine italienne (10 plats)
- Cuisine asiatique — japonaise, thaï, chinoise (15 plats)
- Cuisine du monde — mexicaine, indienne, libanaise (10 plats)
- Plats végétariens / vegans (5 plats minimum)

Chaque plat doit avoir une vraie image (utiliser des URLs Unsplash libres de droits).

---

## Variables d'environnement

```env
# API (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/swipeat
JWT_SECRET=change_me_in_production
PORT=3000
CLIENT_URL=http://localhost:8081

# Mobile (.env)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000
```

---

## Authentification

- JWT avec expiration 7 jours
- Stocker le token côté mobile avec `expo-secure-store` (jamais AsyncStorage pour un token)
- Middleware Fastify `authenticate` à appliquer sur toutes les routes sauf `/auth/*`
- Rafraîchissement automatique du token : hors scope MVP

---

## Gestion des erreurs — Contrat API

Toutes les erreurs retournent ce format :
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou mot de passe incorrect"
  }
}
```

Codes d'erreur à implémenter : `INVALID_CREDENTIALS`, `EMAIL_ALREADY_EXISTS`, `SESSION_NOT_FOUND`, `SESSION_FULL` (max 2 participants MVP), `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`.

---

## Ce qui est explicitement hors scope du MVP

- Filtres avant le swipe (cuisine, régime, budget)
- Suggestions de restaurants via API externe
- Génération de recettes / liste de courses
- Mode groupe (> 2 participants)
- Notifications push
- Undo / retour arrière sur un swipe
- Statistiques et historique
- Partage social
- Recommandations IA

---

## Critères de validation du MVP

- [ ] Un utilisateur peut créer un compte et se connecter
- [ ] Un utilisateur peut swiper des plats en solo et les retrouver dans sa wishlist
- [ ] Deux utilisateurs peuvent rejoindre la même session via un code
- [ ] Quand les deux swipent à droite le même plat, le match s'affiche instantanément
- [ ] Le token JWT est stocké de façon sécurisée et persiste entre les sessions
- [ ] L'app fonctionne sur iOS et Android via Expo Go
