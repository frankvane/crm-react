import { create } from "zustand";

interface GlobalLoadingState {
  count: number;
  loading: boolean;
  start: () => void;
  end: () => void;
}

export const useGlobalLoading = create<GlobalLoadingState>((set, get) => ({
  count: 0,
  loading: false,
  start: () => {
    const newCount = get().count + 1;
    set({ count: newCount, loading: true });
  },
  end: () => {
    const newCount = Math.max(get().count - 1, 0);
    set({ count: newCount, loading: newCount > 0 });
  },
}));
