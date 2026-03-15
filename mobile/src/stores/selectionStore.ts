import { create } from 'zustand';

interface SelectionState {
  selectedIds: Set<number>;
  toggle: (id: number) => void;
  addMultiple: (ids: number[]) => void;
  remove: (id: number) => void;
  clear: () => void;
  isSelected: (id: number) => boolean;
  count: () => number;
  getIds: () => number[];
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: new Set(),

  toggle: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),

  addMultiple: (ids) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      ids.forEach((id) => next.add(id));
      return { selectedIds: next };
    }),

  remove: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      next.delete(id);
      return { selectedIds: next };
    }),

  clear: () => set({ selectedIds: new Set() }),

  isSelected: (id) => get().selectedIds.has(id),

  count: () => get().selectedIds.size,

  getIds: () => Array.from(get().selectedIds),
}));
