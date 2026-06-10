import { createSignal } from '../core/reactivity/Reactivity';

export interface Tab {
  id: string;
  label: string;
}

export const openTabs = createSignal<Tab[]>([]);
export const activeTabId = createSignal<string | null>(null);
