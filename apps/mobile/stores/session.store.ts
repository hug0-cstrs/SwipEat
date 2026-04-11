import { create } from 'zustand';

import type { Tables } from '@swipeat/types';

type Dish = Tables<'dishes'>;
type SwipeSession = Tables<'sessions'>;

interface Participant {
  id: string;
  name: string;
}

interface SessionStore {
  activeSession: SwipeSession | null;
  participants: Participant[];
  deck: Dish[];
  swipedIds: Set<string>;
  matchedDish: Dish | null;
  setActiveSession: (session: SwipeSession | null) => void;
  setDeck: (dishes: Dish[]) => void;
  popDeck: () => Dish | undefined;
  addSwiped: (id: string) => void;
  addParticipant: (participant: Participant) => void;
  setMatch: (dish: Dish) => void;
  reset: () => void;
}

const initialState = {
  activeSession: null,
  participants: [],
  deck: [],
  swipedIds: new Set<string>(),
  matchedDish: null,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,

  setActiveSession: (session) => set({ activeSession: session }),

  setDeck: (dishes) => set({ deck: dishes }),

  popDeck: () => {
    const [first, ...rest] = get().deck;
    set({ deck: rest });
    return first;
  },

  addSwiped: (id) =>
    set((state) => ({ swipedIds: new Set([...state.swipedIds, id]) })),

  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),

  setMatch: (dish) => set({ matchedDish: dish }),

  reset: () => set(initialState),
}));
