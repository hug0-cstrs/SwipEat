import {
  pgTable, uuid, text, boolean,
  integer, timestamp, jsonb, primaryKey
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
