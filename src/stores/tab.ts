import { create } from "zustand";

interface Tab {
  key: string;
  label: string;
}

interface TabState {
  tabs: Tab[];
  activeTab: string;
  addTab: (tab: Tab) => void;
  removeTab: (key: string) => void;
  setActiveTab: (key: string) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [{ key: "/dashboard", label: "仪表盘" }],
  activeTab: "/dashboard",

  addTab: (tab) =>
    set((state) => {
      if (state.tabs.some((t) => t.key === tab.key)) {
        return { activeTab: tab.key };
      }
      return {
        tabs: [...state.tabs, tab],
        activeTab: tab.key,
      };
    }),

  removeTab: (key) =>
    set((state) => {
      const targetIndex = state.tabs.findIndex((tab) => tab.key === key);
      if (targetIndex === -1) return state;

      const newTabs = state.tabs.filter((tab) => tab.key !== key);
      let newActiveTab = state.activeTab;

      if (key === state.activeTab) {
        newActiveTab =
          newTabs[targetIndex]?.key ||
          newTabs[targetIndex - 1]?.key ||
          newTabs[0]?.key ||
          state.activeTab;
      }

      return {
        tabs: newTabs,
        activeTab: newActiveTab,
      };
    }),

  setActiveTab: (key) => set({ activeTab: key }),
}));
