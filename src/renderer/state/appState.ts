import { createSignal } from '../core/reactivity/Reactivity';

export const tabs = createSignal(new Map());
export const activeTabId = createSignal<string | null>(null);
