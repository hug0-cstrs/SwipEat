import { z } from 'zod';

export const SwipeSchema = z.object({
  session_id: z.string().uuid(),
  dish_id: z.string().uuid(),
  direction: z.enum(['right', 'left', 'up']),
});

export const CreateSessionSchema = z.object({
  max_participants: z.number().int().min(2).max(6).default(2),
  match_mode: z.enum(['majority', 'unanimity']).default('unanimity'),
});

export type Swipe = z.infer;
export type CreateSession = z.infer;
