import { describe, it, expect, vi, beforeEach } from 'vitest';
import { router } from '../routing/Router';
import { TabManager } from '../routing/TabManager';
import { eventBus } from '../routing/EventBus';

describe('Routing & Tab Management', () => {
  describe('Router', () => {
    beforeEach(() => {
      // Reset router internal state for tests
      (router as any).routes = [];
      (router as any).currentRoute = null;
    });

    it('should add routes and navigate', () => {
      router.addRoute({ path: '/test', component: 'test-view' });
      const publishSpy = vi.spyOn(eventBus, 'publish');
      
      router.navigate('/test', { data: 123 });
      
      expect(router.getCurrentRoute()?.component).toBe('test-view');
      expect(router.getCurrentRoute()?.props.data).toBe(123);
      expect(publishSpy).toHaveBeenCalledWith('route-changed', expect.objectContaining({ path: '/test' }));
      expect(window.location.pathname).toBe('/test');
    });

    it('should throw when navigating to unknown route', () => {
      expect(() => router.navigate('/unknown')).toThrow('Route not found');
    });
  });

  describe('TabManager', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should save and load tabs', () => {
      const tabs = [{ id: '1', label: 'Tab 1' }, { id: '2', label: 'Tab 2' }];
      TabManager.save(tabs, '2');
      
      const loaded = TabManager.load();
      expect(loaded.tabs).toEqual(tabs);
      expect(loaded.activeId).toBe('2');
    });

    it('should handle empty storage', () => {
      const loaded = TabManager.load();
      expect(loaded.tabs).toEqual([]);
      expect(loaded.activeId).toBeNull();
    });

    it('should clear tabs', () => {
      TabManager.save([{ id: '1', label: 'T1' }], '1');
      TabManager.clear();
      const loaded = TabManager.load();
      expect(loaded.tabs).toEqual([]);
    });
  });
});
