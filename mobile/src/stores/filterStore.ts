import { create } from 'zustand';
import type { Difficulty } from '../types/recipe';

interface FilterState {
  maxCookTimeMinutes: number | null;
  difficulty: Difficulty | null;
  servings: number | null;

  setMaxCookTime: (minutes: number | null) => void;
  setDifficulty: (difficulty: Difficulty | null) => void;
  setServings: (servings: number | null) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  maxCookTimeMinutes: null,
  difficulty: null,
  servings: null,

  setMaxCookTime: (minutes) => set({ maxCookTimeMinutes: minutes }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setServings: (servings) => set({ servings }),
  reset: () => set({ maxCookTimeMinutes: null, difficulty: null, servings: null }),
}));
