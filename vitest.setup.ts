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

// Mock for OPFS
globalThis.navigator.storage = {
  getDirectory: vi.fn().mockResolvedValue({
    getRootDirectory: vi.fn().mockResolvedValue({
      open: vi.fn().mockResolvedValue({}),
    }),
  }),
} as any;
