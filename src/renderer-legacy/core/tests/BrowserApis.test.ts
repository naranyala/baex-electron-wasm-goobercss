import { describe, it, expect, vi } from 'vitest';
import { GeolocationView } from '../../components/views/GeolocationView';
import { NotificationView } from '../../components/views/NotificationView';
import { StorageView } from '../../components/views/StorageView';

describe('Browser API Component Definitions', () => {
  describe('GeolocationView', () => {
    it('should update state on get-location action', () => {
      const setState = vi.fn();
      const handler = GeolocationView.events!['click [data-action="get-location"]'];
      
      handler({} as any, { setState } as any);
      
      expect(setState).toHaveBeenCalled();
      const updateFn = setState.mock.calls[0][0];
      expect(updateFn({})).toEqual({ loading: true, error: null });
    });
  });

  describe('NotificationView', () => {
    it('should request permission', async () => {
      const setState = vi.fn();
      const handler = NotificationView.events!['click [data-action="request-permission"]'];
      
      await handler({} as any, { setState } as any);
      
      expect(Notification.requestPermission).toHaveBeenCalled();
      expect(setState).toHaveBeenCalled();
    });
  });

  describe('StorageView', () => {
    it('should update state on input', () => {
      const setState = vi.fn();
      const handler = StorageView.events!['input [data-action="bind-input"]'];
      const mockEvent = { 
        target: { 
          getAttribute: () => 'newKey',
          value: 'my-key'
        }
      };
      
      handler(mockEvent as any, { setState } as any);
      
      expect(setState).toHaveBeenCalled();
      const updateFn = setState.mock.calls[0][0];
      expect(updateFn({})).toEqual({ newKey: 'my-key' });
    });
  });
});
