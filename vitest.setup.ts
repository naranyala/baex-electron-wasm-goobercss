import { vi } from 'vitest';

// Mock Worker for JSDOM environment
class MockWorker {
  onmessage: (e: any) => void = () => {};
  
  constructor(stringOrBlob: any, options: any) {
    setTimeout(() => {
      // Simulate some response if needed, or just let the tests mock it
    }, 0);
  }

  postMessage(data: any, transfer?: any) {
    // By default, do nothing. Tests can override the behavior.
  }

  terminate() {}
}

globalThis.Worker = MockWorker as any;

// Mock for Notification API
globalThis.Notification = class {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn().mockResolvedValue('granted');
  constructor(public title: string, public options?: NotificationOptions) {}
} as any;

// Mock for Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn((success) => success({
    coords: {
      latitude: 51.5074,
      longitude: 0.1278,
      accuracy: 10
    }
  })),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
globalThis.navigator.geolocation = mockGeolocation as any;

// Mock for Web Storage API
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; }
  };
})();
globalThis.localStorage = localStorageMock as any;

// Mock for OPFS
globalThis.navigator.storage = {
  getDirectory: vi.fn().mockResolvedValue({
    getRootDirectory: vi.fn().mockResolvedValue({
      open: vi.fn().mockResolvedValue({}),
    }),
  }),
} as any;
