import { describe, it, expect } from 'vitest';
import { IRTransformer, IRValidator } from '../bridge/IRTransformer';

describe('IR System', () => {
  describe('IRValidator', () => {
    it('should validate correct commands', () => {
      expect(() => IRValidator.validate({ type: 'Add', payload: { a: 1, b: 2 } })).not.toThrow();
      expect(() => IRValidator.validate({ type: 'RulesQuery', payload: {} })).not.toThrow();
    });

    it('should throw on unknown types', () => {
      expect(() => IRValidator.validate({ type: 'DestroyWorld', payload: {} })).toThrow('Unknown command type');
    });

    it('should throw on invalid payload', () => {
      expect(() => IRValidator.validate({ type: 'Add', payload: { a: '1' } })).toThrow('requires numeric a and b');
      expect(() => IRValidator.validate({ type: 'Fibonacci', payload: {} })).toThrow('requires numeric n');
    });
  });

  describe('IRTransformer', () => {
    it('should resolve success results', () => {
      const result: any = { type: 'Number', payload: 42 };
      expect(IRTransformer.resolveResult(result)).toBe(42);
    });

    it('should throw on error results', () => {
      const result: any = { type: 'Error', payload: 'Kernel Panic' };
      expect(() => IRTransformer.resolveResult(result)).toThrow('Kernel Panic');
    });
  });
});
