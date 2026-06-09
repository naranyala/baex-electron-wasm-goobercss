import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FrontendDatabase } from '../db/FrontendDatabase';

// Mocking the @sqlite.org/sqlite-wasm module
vi.mock('@sqlite.org/sqlite-wasm', () => {
  return {
    default: vi.fn().mockResolvedValue({
      oo1: {
        OpfsDb: class {
          exec = vi.fn();
          run = vi.fn();
          close = vi.fn();
        },
        DB: class {
          exec = vi.fn();
          run = vi.fn();
          close = vi.fn();
        }
      }
    })
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
