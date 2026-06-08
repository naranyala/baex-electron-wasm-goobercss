import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FrontendDatabase } from './FrontendDatabase';

// Mocking the sql.js module
vi.mock('https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.53.0-build1/sqlite-wasm/jswasm/sqlite3.mjs', () => {
  return {
    default: {
      opfs: {
        open: vi.fn().mockImplementation(() => ({
          exec: vi.fn(),
          run: vi.fn(),
          close: vi.fn(),
        })),
      },
      oo1: {
        DB: class {
          exec = vi.fn();
          run = vi.fn();
          close = vi.fn();
        }
      }
    }
  };
});

describe('FrontendDatabase', () => {
  let db: FrontendDatabase;

  beforeEach(async () => {
    db = new FrontendDatabase();
    await db.init();
  });

  it('should initialize successfully', async () => {
    expect(db).toBeDefined();
  });

  it('should throw if querying before init', async () => {
    const uninitDb = new FrontendDatabase();
    await expect(uninitDb.query('SELECT 1')).rejects.toThrow('Database not initialized');
  });
});
