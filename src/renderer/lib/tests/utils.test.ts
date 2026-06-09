import { describe, it, expect } from 'vitest';
import { fuzzySearch, truncate, reverse, slugify } from '../utils/string';
import { sortBy, unique } from '../utils/array';

describe('String Utilities', () => {
  describe('fuzzySearch', () => {
    const MOCK_ITEMS = [
      { id: 'wasm-math', label: 'Wasm Math' },
      { id: 'wasm-text', label: 'Wasm Text' },
    ];

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
  });

  describe('reverse', () => {
    it('should reverse a string', () => {
      expect(reverse('EXBA')).toBe('ABXE');
    });
  });

  describe('slugify', () => {
    it('should convert to slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
    });
  });
});

describe('Array Utilities', () => {
  it('should unique values', () => {
    expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
  });
});
