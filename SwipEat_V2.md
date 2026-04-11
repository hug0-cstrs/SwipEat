# SwipEat — Spécification V2

> **Document de référence pour Claude Code**
> Version : V2 (enrichissement)
> Prérequis : MVP entièrement fonctionnel et en production
> Objectif : Enrichir le contenu, améliorer la rétention, ouvrir au groupe

---

## Vue d'ensemble de la V2

La V2 s'appuie sur les fondations du MVP sans rien casser. Elle introduit :
1. Filtres de swipe personnalisés
2. Mode groupe (jusqu'à 6 participants)
3. Intégration restaurants (Google Places API)
4. Génération de recettes + liste de courses
5. Historique des sessions
6. Lien / QR code d'invitation
7. Bouton Undo (retour arrière)
8. Notifications push

Chaque feature est indépendante. Les implémenter dans l'ordre listé.

---

## 1. Filtres de swipe

### Objectif
Permettre à l'utilisateur de filtrer les plats avant de commencer à swiper, pour ne voir que ce qui lui correspond.

### Nouveaux champs DB

```sql
-- Ajouter à la table sessions
ALTER TABLE sessions ADD COLUMN filters JSONB DEFAULT '{}';

-- Exemple de filters stocké :
-- { "cuisine_types": ["italien","asiatique"], "max_prep_time": 30, "vegan_only": false, "gluten_free_only": false }
```

### Nouvel écran mobile : FiltersSheet.tsx

Bottom sheet (utiliser `@gorhom/bottom-sheet`) qui s'ouvre avant le début d'une session.

Champs du formulaire :
- Type de cuisine (multi-select avec chips) : Française, Italienne, Asiatique, Mexicaine, Indienne, Libanaise, Autre
- Temps de préparation max (slider) : 15 / 30 / 45 / 60+ minutes
- Régime alimentaire (toggles) : Végétarien, Vegan, Sans gluten
- Budget estimé (optionnel, select) : Économique / Standard / Généreux

### Endpoint modifié

**GET /dishes** — ajouter les query params suivants :
```
cuisine_types=italien,asiatique
max_prep_time=30
vegan_only=true
gluten_free_only=false
```

La requête SQL filtre dynamiquement selon les paramètres reçus. Un paramètre absent = pas de filtre sur ce champ.

### Synchronisation en session duo/groupe

Quand une session est partagée, les filtres de l'hôte s'appliquent à tous les participants. Afficher un bandeau informatif aux participants : "Filtres appliqués par [nom de l'hôte]".

---

## 2. Mode groupe (jusqu'à 6 participants)

### Changements DB

```sql
-- Ajouter une limite configurable à la session
ALTER TABLE sessions ADD COLUMN max_participants INT DEFAULT 2;

-- Nouvelle logique de match : vote majoritaire
ALTER TABLE sessions ADD COLUMN match_threshold INT DEFAULT 2; -- nb de right/up requis
```

### Logique de match mise à jour

Remplacer la logique MVP (tous les participants doivent swiper right) par :

```
match = (nombre de right/up sur ce plat) >= session.match_threshold
```

Pour une session de 6 personnes, le `match_threshold` par défaut est `ceil(6 / 2) = 3` (majorité simple). L'hôte peut choisir "unanimité" au moment de créer la session.

### Nouveau paramètre à la création de session

**POST /sessions** — body enrichi :
```json
{
  "max_participants": 4,
  "match_mode": "majority"    // "majority" | "unanimity"
}
```

### UI mobile

- Écran de session : afficher les avatars de tous les participants (cercles initiales)
- Indicateur de progression : "3/4 ont swipé ce plat" (sans révéler la direction)
- Afficher le nombre de participants restants à rejoindre si la session est en attente

### Événement WebSocket mis à jour

```json
// Nouveau champ dans "user_swiped"
{
  "user_id": "...",
  "dish_id": "...",
  "votes_count": 2,
  "votes_needed": 3
}
```

---

## 3. Intégration restaurants (Google Places API)

### Objectif
Proposer, après un match, des restaurants proches servant ce type de plat.

### Configuration

```env
# Ajouter à l'API
GOOGLE_PLACES_API_KEY=...
```

### Nouvel endpoint

**GET /restaurants/nearby**
```
Query params :
  lat=43.6047       (latitude de l'utilisateur)
  lng=1.4442        (longitude)
  cuisine_type=italien
  radius=5000       (en mètres, défaut 3000)
```

```json
// Response 200
{
  "restaurants": [
    {
      "place_id": "ChIJ...",
      "name": "Trattoria Roma",
      "address": "12 rue des Capucins, Toulouse",
      "rating": 4.3,
      "price_level": 2,          // 1-4
      "open_now": true,
      "photo_url": "https://...",
      "maps_url": "https://maps.google.com/..."
    }
  ]
}
```

### Appel Google Places côté serveur

Utiliser l'endpoint `nearbysearch` de Places API v1. Ne jamais exposer la clé API côté client. Le backend fait l'appel et retourne les données filtrées.

```ts
// Exemple d'appel
const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
  + `?location=${lat},${lng}`
  + `&radius=${radius}`
  + `&type=restaurant`
  + `&keyword=${cuisine_type}`
  + `&key=${process.env.GOOGLE_PLACES_API_KEY}`;
```

### Permissions mobile

Demander la permission de géolocalisation avec `expo-location` au moment où l'utilisateur clique sur "Restaurants proches" dans l'écran de match. Ne pas demander la permission au lancement de l'app.

### Nouvel écran : NearbyRestaurants.tsx

- Liste des restaurants retournés (FlatList)
- Carte mini-preview en haut (optionnel, peut être ajouté en V3)
- Tap sur un restaurant → ouvrir Google Maps avec `Linking.openURL`

---

## 4. Recette + liste de courses

### Objectif
Après un match, l'utilisateur peut voir la recette complète du plat et générer une liste de courses.

### Nouveaux champs DB

```sql
-- Ajouter à la table dishes
ALTER TABLE dishes ADD COLUMN recipe_steps JSONB;     -- tableau d'étapes
ALTER TABLE dishes ADD COLUMN ingredients JSONB;       -- tableau d'ingrédients avec quantités

-- Structure recipe_steps :
-- [{ "step": 1, "text": "Faire revenir les oignons..." }, ...]

-- Structure ingredients :
-- [{ "name": "Oignon", "quantity": "2", "unit": "pièces" }, ...]
```

Mettre à jour le script de seed pour renseigner `recipe_steps` et `ingredients` sur tous les plats existants.

### Endpoint mis à jour

**GET /dishes/:id** — inclure les nouveaux champs dans la réponse.

### Nouveaux écrans mobile

**RecipeScreen.tsx**
- Afficher la photo du plat en header (collapsible)
- Section ingrédients : liste avec cases à cocher
- Section étapes : numérotées avec texte clair
- Bouton "Générer la liste de courses" en bas

**GroceryListScreen.tsx**
- Liste des ingrédients (regroupés par catégorie : légumes, viandes, épices…)
- Chaque item est cochable (state local, pas persisté en MVP)
- Bouton "Partager la liste" → `Share.share()` natif (texte simple)

### Pas d'IA pour la V2

La recette et la liste de courses sont des données statiques stockées en base. L'IA de génération automatique est réservée à la V3.

---

## 5. Historique des sessions

### Objectif
Permettre à l'utilisateur de retrouver ses sessions passées et les plats matchés.

### Nouvel endpoint

**GET /sessions/history**
```json
// Response 200
{
  "sessions": [
    {
      "id": "...",
      "code": "XK92PL",
      "status": "matched",
      "matched_at": "2025-03-15T19:32:00Z",
      "participants": [
        { "id": "...", "name": "Alice" },
        { "id": "...", "name": "Bob" }
      ],
      "match_dish": {
        "id": "...",
        "name": "Risotto aux champignons",
        "image_url": "..."
      }
    }
  ]
}
```

### Nouvel écran : HistoryScreen.tsx

- Liste des sessions passées, triée par date décroissante
- Afficher uniquement les sessions avec `status = 'matched'` ou `status = 'closed'`
- Tap sur une session → voir le plat matchée + les participants

---

## 6. Lien et QR code d'invitation

### Objectif
Remplacer le partage de code textuel par un lien cliquable ou un QR code scannable.

### Deep link

Configurer le deep link avec Expo : `swipeat://session/XK92PL`

En production, utiliser un lien universel : `https://swipeat.app/join/XK92PL`

### Endpoint

**GET /sessions/:id/invite** — retourne les données d'invitation :
```json
{
  "code": "XK92PL",
  "deep_link": "swipeat://session/XK92PL",
  "web_link": "https://swipeat.app/join/XK92PL"
}
```

### QR Code mobile

Utiliser la librairie `react-native-qrcode-svg` pour générer le QR code côté client à partir du `web_link`. Afficher dans un modal avec bouton "Partager" → `Share.share()`.

---

## 7. Bouton Undo (retour arrière)

### Objectif
Permettre à l'utilisateur de revenir sur sa dernière carte swipée.

### Contrainte
Une seule annulation possible à la fois (pas d'historique illimité).

### Côté API

**DELETE /swipes/last**
```
Header : Authorization: Bearer <token>
Query param : session_id=...
```
Supprime le dernier swipe de l'utilisateur dans cette session et retourne le `dish_id` annulé.

### Côté mobile

- Bouton undo en bas de l'écran deck (icône flèche gauche)
- Désactivé si aucun swipe n'a encore été fait dans la session
- Après undo : réinsérer la carte annulée en haut du deck (animation de retour depuis le bas)
- Désactiver le bouton undo pendant l'animation

---

## 8. Notifications push

### Configuration

Utiliser `expo-notifications` pour iOS et Android.

```env
# Ajouter à l'API
EXPO_ACCESS_TOKEN=...    # Pour envoyer via Expo Push Service
```

### Nouveaux champs DB

```sql
ALTER TABLE users ADD COLUMN push_token TEXT;
ALTER TABLE users ADD COLUMN push_enabled BOOLEAN DEFAULT TRUE;
```

### Endpoint pour enregistrer le token

**POST /users/push-token**
```json
// Body
{ "token": "ExponentPushToken[...]" }
```

### Notifications à envoyer

| Déclencheur | Titre | Corps |
|-------------|-------|-------|
| Un participant rejoint la session | "Quelqu'un a rejoint !" | "[Nom] est prêt à swiper" |
| Match trouvé | "C'est un match !" | "Vous avez tous aimé [nom du plat]" |
| Session créée mais personne n'a rejoint après 10min | "En attente..." | "Partage le code [CODE] pour commencer" |

### Envoi côté serveur

Utiliser le SDK Expo pour envoyer les push :
```ts
import Expo from 'expo-server-sdk';
const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
```

---

## Migrations DB

Créer un fichier de migration pour chaque modification de schéma. Utiliser `node-pg-migrate` ou un fichier SQL versionné.

Ordre des migrations V2 :
1. `add_filters_to_sessions.sql`
2. `add_group_mode_to_sessions.sql`
3. `add_recipe_fields_to_dishes.sql`
4. `add_push_token_to_users.sql`
5. `add_undo_support.sql` (index sur swipes par date)

---

## Critères de validation de la V2

- [ ] Les filtres réduisent correctement le deck de plats avant le swipe
- [ ] Une session peut accueillir jusqu'à 6 participants
- [ ] La logique de match fonctionne en mode majorité et unanimité
- [ ] Des restaurants Google Places s'affichent après un match
- [ ] La recette et la liste de courses sont accessibles après un match
- [ ] L'historique affiche les sessions passées avec le plat matché
- [ ] Le QR code permet de rejoindre une session sans saisir le code
- [ ] Le bouton undo réinsère la dernière carte dans le deck
- [ ] Les notifications push arrivent sur iOS et Android
