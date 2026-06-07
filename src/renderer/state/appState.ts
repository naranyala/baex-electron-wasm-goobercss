import { createSignal } from '../framework/Reactivity';

export const tabs = createSignal(new Map());
export const activeTabId = createSignal<string | null>(null);
