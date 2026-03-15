import { create } from 'zustand';
import type { CoachingStatus } from '../types/coaching';

interface CoachingStoreState {
  recipeId: number | null;
  currentStep: number;
  totalSteps: number;
  status: CoachingStatus;
  remainingSeconds: number | null;
  startedAt: string | null;
  elapsedSeconds: number;

  start: (recipeId: number, totalSteps: number) => void;
  setStep: (step: number) => void;
  setStatus: (status: CoachingStatus) => void;
  setRemainingSeconds: (seconds: number | null) => void;
  tick: () => void;
  reset: () => void;
}

export const useCoachingStore = create<CoachingStoreState>((set) => ({
  recipeId: null,
  currentStep: 0,
  totalSteps: 0,
  status: 'IDLE',
  remainingSeconds: null,
  startedAt: null,
  elapsedSeconds: 0,

  start: (recipeId, totalSteps) =>
    set({
      recipeId,
      currentStep: 0,
      totalSteps,
      status: 'PLAYING',
      remainingSeconds: null,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
    }),

  setStep: (step) => set({ currentStep: step, remainingSeconds: null }),
  setStatus: (status) => set({ status }),
  setRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),
  tick: () =>
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
      remainingSeconds:
        state.remainingSeconds !== null && state.remainingSeconds > 0
          ? state.remainingSeconds - 1
          : state.remainingSeconds,
    })),
  reset: () =>
    set({
      recipeId: null,
      currentStep: 0,
      totalSteps: 0,
      status: 'IDLE',
      remainingSeconds: null,
      startedAt: null,
      elapsedSeconds: 0,
    }),
}));
