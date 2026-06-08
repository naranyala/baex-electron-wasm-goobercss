import { services } from '../framework/ServiceRegistry';
import { eventBus } from '../framework/EventBus';
import { describe, it, expect, vi } from 'vitest';

describe('Core Infrastructure', () => {
  describe('ServiceRegistry', () => {
    it('should register and retrieve services', () => {
      const mockService = { id: 'test' };
      services.register('test-service', mockService);
      expect(services.has('test-service')).toBe(true);
      expect(services.get('test-service')).toBe(mockService);
    });

    it('should throw error when service is missing', () => {
      expect(() => services.get('non-existent')).toThrow('Service non-existent not found in registry');
    });
  });

  describe('EventBus', () => {
    it('should publish and subscribe to events', () => {
      const handler = vi.fn();
      eventBus.subscribe('test-event', handler);
      eventBus.publish('test-event', { foo: 'bar' });
      expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should allow unsubscribing', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.subscribe('test-event', handler);
      unsubscribe();
      eventBus.publish('test-event', { foo: 'bar' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.subscribe('multi', handler1);
      eventBus.subscribe('multi', handler2);
      eventBus.publish('multi', true);
      expect(handler1).toHaveBeenCalledWith(true);
      expect(handler2).toHaveBeenCalledWith(true);
    });
  });
});
