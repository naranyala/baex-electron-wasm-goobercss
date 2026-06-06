import { describe, it, expect } from 'vitest';
import { fuzzySearch, MENU_ITEMS } from './main';

describe('fuzzySearch', () => {
  it('should find items by exact match', () => {
    const results = fuzzySearch('Native Engine', MENU_ITEMS);
    expect(results.some(i => i.id === 'zig-backend')).toBe(true);
  });

  it('should find items by partial match', () => {
    const results = fuzzySearch('Engine', MENU_ITEMS);
    expect(results.some(i => i.id === 'zig-backend')).toBe(true);
  });

  it('should find items by fuzzy match', () => {
    // 'ntv eng' should match 'Native Engine'
    const results = fuzzySearch('ntv eng', MENU_ITEMS);
    expect(results.some(i => i.id === 'zig-backend')).toBe(true);
  });

  it('should return an empty array when no match is found', () => {
    const results = fuzzySearch('nonexistent', MENU_ITEMS);
    expect(results.length).toBe(0);
  });

  it('should be case insensitive', () => {
    const results = fuzzySearch('NATIVE', MENU_ITEMS);
    expect(results.some(i => i.id === 'zig-backend')).toBe(true);
  });
});
