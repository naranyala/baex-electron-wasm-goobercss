const STORAGE_KEY = 'baex-tabs';

export interface StoredTab {
  id: string;
  label: string;
}

export const TabManager = {
  save(tabs: Map<string, { label: string }>): void {
    const data: StoredTab[] = Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  load(): StoredTab[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
