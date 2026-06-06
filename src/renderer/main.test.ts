import { describe, it, expect } from 'vitest';
import { fuzzySearch } from './main';

const MOCK_ITEMS = [
  { id: 'wasm-math', label: 'Wasm Math' },
  { id: 'wasm-text', label: 'Wasm Text' },
];

describe('fuzzySearch', () => {
  it('should find items by exact match', () => {
    const results = fuzzySearch('Wasm Math', MOCK_ITEMS);
    expect(results.some(i => i.id === 'wasm-math')).toBe(true);
  });

  it('should find items by partial match', () => {
    const results = fuzzySearch('Math', MOCK_ITEMS);
    expect(results.some(i => i.id === 'wasm-math')).toBe(true);
  });

  it('should find items by fuzzy match', () => {
    const results = fuzzySearch('ws mth', MOCK_ITEMS);
    expect(results.some(i => i.id === 'wasm-math')).toBe(true);
  });

  it('should return an empty array when no match is found', () => {
    const results = fuzzySearch('nonexistent', MOCK_ITEMS);
    expect(results.length).toBe(0);
  });

  it('should be case insensitive', () => {
    const results = fuzzySearch('WASM', MOCK_ITEMS);
    expect(results.some(i => i.id === 'wasm-math')).toBe(true);
  });
});
