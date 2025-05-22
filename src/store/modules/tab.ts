import { create } from "zustand";

export interface Tab {
	key: string;
	label: string;
	componentPath: string;
	closable?: boolean;
}

interface TabState {
	tabs: Tab[];
	activeTab: string;
	addTab: (tab: Tab) => void;
	removeTab: (key: string) => void;
	removeOtherTabs: (key: string) => void;
	removeLeftTabs: (key: string) => void;
	removeRightTabs: (key: string) => void;
	removeAllTabs: () => void;
}

const DEFAULT_TAB: Tab = {
	key: "/app/dashboard",
	label: "仪表盘",
	componentPath: "pages/dashboard",
	closable: false,
};

export const useTabStore = create<TabState>((set) => ({
	tabs: [DEFAULT_TAB],
	activeTab: DEFAULT_TAB.key,

	addTab: (tab) =>
		set((state) => {
			if (state.tabs.some((t) => t.key === tab.key)) {
				return { activeTab: tab.key };
			}
			return {
				tabs: [...state.tabs, { ...tab, closable: tab.closable ?? true }],
				activeTab: tab.key,
			};
		}),

	removeTab: (key) =>
		set((state) => {
			if (key === DEFAULT_TAB.key) {
				return state;
			}

			const newTabs = state.tabs.filter((tab) => tab.key !== key);
			let newActiveTab =
				state.activeTab === key
					? newTabs[newTabs.length - 1].key
					: state.activeTab;

			if (key === state.activeTab) {
				newActiveTab =
					newTabs[newTabs.length - 1]?.key ||
					newTabs[newTabs.length - 2]?.key ||
					newTabs[0].key;
			}

			return {
				tabs: newTabs,
				activeTab: newActiveTab,
			};
		}),

	removeOtherTabs: (key) =>
		set((state) => {
			const targetTab = state.tabs.find((tab) => tab.key === key);
			if (!targetTab) return state;

			const newTabs = [DEFAULT_TAB];
			if (key !== DEFAULT_TAB.key) {
				newTabs.push(targetTab);
			}

			return {
				tabs: newTabs,
				activeTab: key,
			};
		}),

	removeLeftTabs: (key) =>
		set((state) => {
			const index = state.tabs.findIndex((tab) => tab.key === key);
			if (index === -1) return state;

			const remainingTabs = state.tabs.slice(index);
			const newTabs = remainingTabs.some((tab) => tab.key === DEFAULT_TAB.key)
				? remainingTabs
				: [DEFAULT_TAB, ...remainingTabs];

			return {
				tabs: newTabs,
				activeTab: key,
			};
		}),

	removeRightTabs: (key) =>
		set((state) => {
			const index = state.tabs.findIndex((tab) => tab.key === key);
			if (index === -1) return state;

			const remainingTabs = state.tabs.slice(0, index + 1);
			const newTabs = remainingTabs.some((tab) => tab.key === DEFAULT_TAB.key)
				? remainingTabs
				: [
						DEFAULT_TAB,
						...remainingTabs.filter((tab) => tab.key !== DEFAULT_TAB.key),
					];

			return {
				tabs: newTabs,
				activeTab: key,
			};
		}),

	removeAllTabs: () =>
		set({
			tabs: [DEFAULT_TAB],
			activeTab: DEFAULT_TAB.key,
		}),
}));
