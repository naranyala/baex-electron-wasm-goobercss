import { Tab } from '../../state/appState';

const STORAGE_KEY = 'exba-tabs';
const ACTIVE_KEY = 'exba-active-tab';

export const TabManager = {
  save(tabs: Tab[], activeId: string | null): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    else localStorage.removeItem(ACTIVE_KEY);
  },

  load(): { tabs: Tab[]; activeId: string | null } {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const tabs: Tab[] = raw ? JSON.parse(raw) : [];
      const activeId = localStorage.getItem(ACTIVE_KEY);
      return { tabs, activeId };
    } catch {
      return { tabs: [], activeId: null };
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  },
};
