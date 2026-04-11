import {
  pgTable, uuid, text, boolean,
  integer, timestamp, jsonb, primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  pushToken: text('push_token'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dishes = pgTable('dishes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  cuisineType: text('cuisine_type').notNull(),
  prepTime: integer('prep_time'),
  difficulty: text('difficulty'),
  calories: integer('calories'),
  isVegan: boolean('is_vegan').default(false),
  isGlutenFree: boolean('is_gluten_free').default(false),
  recipeSteps: jsonb('recipe_steps'),
  ingredients: jsonb('ingredients'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').unique().notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  status: text('status').default('waiting'),
  maxParticipants: integer('max_participants').default(2),
  matchDishId: uuid('match_dish_id').references(() => dishes.id),
  createdAt: timestamp('created_at').defaultNow(),
  matchedAt: timestamp('matched_at'),
});

export const sessionParticipants = pgTable(
  'session_participants',
  {
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.sessionId, t.userId] })],
);

export const swipes = pgTable(
  'swipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .references(() => sessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id),
    dishId: uuid('dish_id').references(() => dishes.id),
    // 'right' | 'left' | 'up'
    direction: text('direction'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [uniqueIndex('swipes_session_user_dish_idx').on(t.sessionId, t.userId, t.dishId)],
);

export const wishlist = pgTable(
  'wishlist',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    dishId: uuid('dish_id')
      .notNull()
      .references(() => dishes.id),
    addedAt: timestamp('added_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.dishId] })],
);
