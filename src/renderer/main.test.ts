import { describe, it, expect } from 'vitest';
import { fuzzySearch, MENU_ITEMS } from './main';

describe('fuzzySearch', () => {
  it('should find items by exact match', () => {
    const results = fuzzySearch('Wasm Math', MENU_ITEMS);
    expect(results.some(i => i.id === 'wasm-math')).toBe(true);
  });

  it('should find items by partial match', () => {
    const results = fuzzySearch('Math', MENU_ITEMS);
    expect(results.some(i => i.id === 'wasm-math')).toBe(true);
  });

  it('should find items by fuzzy match', () => {
    // 'ws mth' should match 'Wasm Math'
    const results = fuzzySearch('ws mth', MENU_ITEMS);
    expect(results.some(i => i.id === 'wasm-math')).toBe(true);
  });

  it('should return an empty array when no match is found', () => {
    const results = fuzzySearch('nonexistent', MENU_ITEMS);
    expect(results.length).toBe(0);
  });

  it('should be case insensitive', () => {
    const results = fuzzySearch('WASM', MENU_ITEMS);
    expect(results.some(i => i.id === 'wasm-math')).toBe(true);
  });
});
