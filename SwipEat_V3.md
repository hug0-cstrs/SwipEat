# SwipEat — Spécification V3

> **Document de référence pour Claude Code**
> Version : V3 (croissance & personnalisation)
> Prérequis : V2 entièrement fonctionnelle et en production
> Objectif : Personnalisation IA, social, monétisation et viralité

---

## Vue d'ensemble de la V3

La V3 transforme SwipEat d'une app utilitaire en plateforme sociale et intelligente. Elle introduit :
1. Recommandations IA (Anthropic API)
2. Génération de recette par IA
3. Système d'amis et de contacts
4. Statistiques personnelles et de compatibilité
5. Partage social enrichi
6. Programme de fidélité / gamification
7. Abonnement premium (monétisation)

---

## 1. Recommandations IA

### Objectif
Personnaliser le deck de swipe en fonction des goûts passés de l'utilisateur, sans qu'il ait à configurer quoi que ce soit.

### Architecture

Le système de recommandation est entièrement côté serveur. Le mobile continue d'appeler `GET /dishes` — seul l'ordre et la sélection des plats changent.

### Données utilisées pour le scoring

- Historique de swipes (right = +1, up = +2, left = -1)
- Cuisine types des plats likés
- Temps de préparation moyen des plats likés
- Compatibilité vegan/gluten-free
- Heure de la journée (déjeuner vs dîner)
- Jour de la semaine

### Nouveau service : RecommendationService

```ts
// src/services/recommendation.service.ts

// Construire le profil de goût de l'utilisateur à partir de son historique
async function buildUserTasteProfile(userId: string): Promise<TasteProfile> {
  // Requête SQL : agréger les swipes des 30 derniers jours
  // Calculer le score par cuisine_type, prep_time_range, is_vegan, is_gluten_free
  // Retourner un objet TasteProfile normalisé
}

// Scorer et trier les plats non encore vus par l'utilisateur
async function rankDishesForUser(userId: string, candidates: Dish[]): Promise<Dish[]> {
  const profile = await buildUserTasteProfile(userId);
  return candidates
    .map(dish => ({ dish, score: computeScore(dish, profile) }))
    .sort((a, b) => b.score - a.score)
    .map(({ dish }) => dish);
}
```

### Intégration Anthropic API (optionnelle, enrichissement)

Pour les utilisateurs avec peu d'historique (cold start < 10 swipes), utiliser Claude pour générer une explication des recommandations et afficher une suggestion textuelle dans l'app :

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateRecommendationExplanation(profile: TasteProfile): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `En une phrase courte et engageante, explique pourquoi ces plats sont recommandés à un utilisateur qui aime : ${JSON.stringify(profile)}. Réponds en français, style app mobile, sans bullet points.`
    }]
  });
  return message.content[0].type === 'text' ? message.content[0].text : '';
}
```

### Nouvel endpoint

**GET /dishes/recommended**
```json
// Response 200
{
  "dishes": [...],   // triés par score de recommandation
  "explanation": "Basé sur ton amour pour la cuisine asiatique et les plats rapides…",
  "cold_start": false
}
```

### Nouvelles colonnes DB

```sql
-- Cache du profil de goût (recalculé toutes les 24h)
CREATE TABLE user_taste_profiles (
  user_id     UUID PRIMARY KEY REFERENCES users(id),
  profile     JSONB NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Génération de recettes par IA

### Objectif
Permettre à l'utilisateur de générer une recette personnalisée à partir de contraintes (ingrédients disponibles, nombre de personnes, temps).

### Nouvel écran : GenerateRecipeScreen.tsx

Formulaire avec :
- Ingrédients disponibles (champ texte libre ou chips suggérées)
- Nombre de personnes (stepper 1-8)
- Temps maximum disponible (slider 15-90 min)
- Régime alimentaire (optionnel)

### Nouvel endpoint

**POST /ai/generate-recipe**
```json
// Body
{
  "ingredients": ["poulet", "tomates", "ail", "basilic"],
  "servings": 4,
  "max_time": 30,
  "dietary": "none"
}

// Response 200 (streaming SSE)
{
  "recipe": {
    "name": "Poulet à la tomate et basilic",
    "description": "...",
    "prep_time": 25,
    "ingredients": [...],
    "steps": [...],
    "grocery_additions": ["huile d'olive", "sel"]
  }
}
```

### Implémentation côté serveur

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Utiliser le streaming pour afficher la recette progressivement
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: buildRecipePrompt({ ingredients, servings, max_time, dietary })
  }],
  system: `Tu es un chef cuisinier expert. Génère des recettes en JSON valide uniquement, sans texte autour. 
  Format : { "name": "...", "prep_time": N, "ingredients": [{"name":"...","quantity":"...","unit":"..."}], "steps": [{"step":N,"text":"..."}] }`
});

// Piper le stream vers la réponse HTTP (SSE)
```

### Affichage mobile

Utiliser une animation de typing pendant la génération (simulée si pas SSE). Une fois la recette générée :
- Afficher directement dans RecipeScreen
- Bouton "Sauvegarder dans mes recettes" → POST `/users/saved-recipes`

---

## 3. Système d'amis

### Objectif
Permettre aux utilisateurs de se retrouver facilement et de lancer des sessions sans partager de code.

### Nouvelles tables DB

```sql
-- Relations d'amitié
CREATE TABLE friendships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID REFERENCES users(id),
  addressee_id  UUID REFERENCES users(id),
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','blocked')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id)
);

-- Recettes sauvegardées par l'utilisateur
CREATE TABLE saved_recipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  dish_id     UUID REFERENCES dishes(id),   -- null si recette générée par IA
  recipe_data JSONB,                          -- données recette (IA ou catalogue)
  saved_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Endpoints amis

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/friends` | Liste de mes amis acceptés |
| GET | `/friends/requests` | Demandes reçues en attente |
| POST | `/friends/request` | Envoyer une demande (par email ou username) |
| PATCH | `/friends/:id/accept` | Accepter une demande |
| DELETE | `/friends/:id` | Supprimer un ami ou refuser |
| GET | `/friends/:id/wishlist` | Voir la wishlist publique d'un ami |

### Ajouter un username aux utilisateurs

```sql
ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
CREATE INDEX idx_users_username ON users(username);
```

Permettre la recherche d'amis par username ou email.

### Nouveaux écrans mobile

**FriendsScreen.tsx** — liste d'amis avec statut en ligne (via Socket.io), bouton "Inviter à swiper" qui crée une session et envoie une notification.

**FriendProfileScreen.tsx** — profil d'un ami, sa wishlist publique, son score de compatibilité, bouton "Swiper ensemble".

---

## 4. Statistiques personnelles et compatibilité

### Objectif
Donner à l'utilisateur une vision de ses goûts et de sa compatibilité avec ses amis.

### Nouveaux endpoints

**GET /stats/me** — statistiques personnelles
```json
{
  "total_swipes": 342,
  "total_likes": 187,
  "total_sessions": 24,
  "favorite_cuisine": "asiatique",
  "avg_prep_time_liked": 28,
  "vegan_ratio": 0.34,
  "top_dishes": [
    { "dish": {...}, "liked_count": 5 }
  ],
  "activity_by_day": {
    "monday": 12, "tuesday": 8, ...
  }
}
```

**GET /stats/compatibility/:friend_id** — compatibilité avec un ami
```json
{
  "compatibility_score": 78,
  "shared_likes": 23,
  "common_cuisines": ["asiatique", "italien"],
  "divergence": {
    "you_like_not_them": ["mexicain"],
    "they_like_not_you": ["libanais"]
  }
}
```

### Calcul du score de compatibilité

```
compatibility_score = (plats likés en commun / total des plats vus par les deux) * 100
```
Arrondi à l'entier le plus proche, plafonné à 100.

### Nouvel écran : StatsScreen.tsx

- Score de compatibilité avec chaque ami (liste triée du plus au moins compatible)
- Graphique en anneau : répartition par cuisine (utiliser `react-native-svg` + un composant `PieChart` custom)
- Top 3 des plats les plus likés (cards avec photo)
- Streak : nombre de jours consécutifs avec au moins un swipe

---

## 5. Partage social enrichi

### Objectif
Rendre chaque match partageable sous forme d'une belle image de résultat.

### Génération d'image de résultat

Utiliser `react-native-view-shot` pour capturer une vue React Native en image et la partager.

**ShareCard.tsx** — composant non affiché à l'écran, rendu pour capture :
- Fond coloré aux couleurs de l'app
- Photo du plat matchée
- Texte : "Ce soir on mange [NOM DU PLAT]"
- Avatars des participants
- Logo SwipEat en bas

```ts
import ViewShot from 'react-native-view-shot';
import { Share } from 'react-native';

const shareMatch = async () => {
  const uri = await viewShotRef.current.capture();
  await Share.share({ url: uri, message: 'Notre match du soir sur SwipEat !' });
};
```

### Story Instagram

Intégrer le partage direct en story Instagram via `expo-sharing` si l'app Instagram est installée.

---

## 6. Gamification

### Objectif
Encourager l'engagement quotidien par des récompenses et des badges.

### Nouvelles tables DB

```sql
-- Badges débloqués
CREATE TABLE user_badges (
  user_id     UUID REFERENCES users(id),
  badge_id    TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Streaks
CREATE TABLE user_streaks (
  user_id         UUID PRIMARY KEY REFERENCES users(id),
  current_streak  INT DEFAULT 0,
  longest_streak  INT DEFAULT 0,
  last_active_at  DATE
);
```

### Liste des badges MVP V3

| Badge ID | Nom | Condition |
|----------|-----|-----------|
| `first_match` | Premier match ! | Obtenir son premier match |
| `swipe_100` | Swipeur assidu | 100 swipes au total |
| `streak_7` | Une semaine de suite | 7 jours de streak |
| `group_6` | Grande tablée | Participer à une session de 6 |
| `compatibility_90` | Âmes sœurs | Score de compatibilité ≥ 90% |
| `vegan_lover` | Green cuisine | 50% de swipes vegan sur 30 jours |

### Notification de badge

Quand un badge est débloqué, émettre un événement Socket.io `badge_unlocked` et envoyer une notification push.

---

## 7. Abonnement premium

### Objectif
Monétiser l'app via un abonnement mensuel qui débloque des fonctionnalités avancées.

### Fonctionnalités premium

| Fonctionnalité | Gratuit | Premium |
|----------------|---------|---------|
| Swipe solo | Illimité | Illimité |
| Sessions duo | Illimité | Illimité |
| Sessions groupe | 2/mois | Illimité |
| Génération recette IA | 3/mois | Illimité |
| Restaurants proches | 5/jour | Illimité |
| Statistiques avancées | Non | Oui |
| Partage social enrichi | Non | Oui |
| Badge exclusifs | Non | Oui |

### Implémentation

Utiliser `expo-in-app-purchases` pour iOS et Android.

```sql
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free'
  CHECK (subscription_status IN ('free','premium','cancelled'));
ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMPTZ;
```

**Nouvel endpoint de vérification**

**POST /subscriptions/verify** — reçoit le reçu d'achat et le valide côté serveur via Apple / Google APIs.

### Middleware de restriction côté API

```ts
// Middleware à appliquer sur les routes premium
async function requirePremium(req, reply) {
  const user = await getUser(req.userId);
  if (user.subscription_status !== 'premium' || user.subscription_expires_at < new Date()) {
    return reply.status(402).send({ error: { code: 'PREMIUM_REQUIRED', message: 'Cette fonctionnalité nécessite un abonnement premium' } });
  }
}
```

---

## Nouvelles variables d'environnement

```env
# IA
ANTHROPIC_API_KEY=sk-ant-...

# Paiement (validation server-side)
APPLE_SHARED_SECRET=...
GOOGLE_PLAY_PACKAGE_NAME=com.swipeat.app

# Analytics (optionnel)
POSTHOG_API_KEY=...
```

---

## Critères de validation de la V3

- [ ] Le deck de plats est personnalisé selon l'historique de l'utilisateur
- [ ] La génération de recette IA fonctionne et s'affiche en streaming
- [ ] On peut ajouter des amis par username et voir leur wishlist
- [ ] Le score de compatibilité s'affiche correctement
- [ ] La carte de partage est générée et partageable
- [ ] Les badges se débloquent aux conditions définies
- [ ] L'abonnement premium est fonctionnel sur iOS et Android
- [ ] Les routes premium retournent 402 si l'utilisateur n'est pas abonné
