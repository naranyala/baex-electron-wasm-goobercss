import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SQLiteWasmManager } from '../bridge/sqlite-wasm';

// ─── Mock SQLite WASM ──────────────────────────────────────────
const mockDb = {
  close: vi.fn(),
  exec: vi.fn(({ sql, bind, callback }) => {
    if (sql.includes('sqlite_master')) {
      callback({ name: 'users' });
    }
    if (sql.includes('PRAGMA table_info')) {
      callback({ name: 'id', type: 'INTEGER' });
      callback({ name: 'name', type: 'TEXT' });
    }
    if (sql.includes('SELECT * FROM users')) {
      callback({ id: 1, name: 'Alice' });
      callback({ id: 2, name: 'Bob' });
    }
  }),
  pointer: 12345,
};

const mockSqlite3 = {
  oo1: {
    DB: vi.fn(() => mockDb),
  },
  wasm: {
    allocFromTypedArray: vi.fn(() => 54321),
    alloc: vi.fn(() => 666),
    getPtrValue: vi.fn(() => 100n),
    heapU8: vi.fn(() => ({ buffer: new ArrayBuffer(1000) })),
    free: vi.fn(),
  },
  capi: {
    sqlite3_deserialize: vi.fn(() => 0),
    sqlite3_serialize: vi.fn(() => 777),
    sqlite3_free: vi.fn(),
    SQLITE_DESERIALIZE_FREEONCLOSE: 1,
    SQLITE_DESERIALIZE_RESIZEABLE: 2,
  },
};

vi.mock('@sqlite.org/sqlite-wasm', () => ({
  default: vi.fn(async () => mockSqlite3),
}));

describe('SQLiteWasmManager', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset internal state of SQLiteWasmManager
    (SQLiteWasmManager as any).sqlite3 = null;
    (SQLiteWasmManager as any).db = null;
    (SQLiteWasmManager as any).isInitializing = false;
  });

  it('should initialize the SQLite module', async () => {
    const sqlite3 = await SQLiteWasmManager.init();
    expect(sqlite3).toBe(mockSqlite3);
    expect((SQLiteWasmManager as any).sqlite3).toBe(mockSqlite3);
  });

  it('should create an empty in-memory database', async () => {
    await SQLiteWasmManager.createEmpty();
    expect(mockSqlite3.oo1.DB).toHaveBeenCalledWith(':memory:');
    expect(SQLiteWasmManager.hasDatabase()).toBe(true);
  });

  it('should import a database from a buffer', async () => {
    const buffer = new Uint8Array([1, 2, 3]);
    await SQLiteWasmManager.importDatabase(buffer);
    
    expect(mockSqlite3.wasm.allocFromTypedArray).toHaveBeenCalledWith(buffer);
    expect(mockSqlite3.capi.sqlite3_deserialize).toHaveBeenCalled();
    expect(SQLiteWasmManager.hasDatabase()).toBe(true);
  });

  it('should execute SQL and return rows', async () => {
    await SQLiteWasmManager.createEmpty();
    const rows = SQLiteWasmManager.execute('SELECT * FROM users');
    
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ id: 1, name: 'Alice' });
    expect(mockDb.exec).toHaveBeenCalled();
  });

  it('should list tables', async () => {
    await SQLiteWasmManager.createEmpty();
    const tables = SQLiteWasmManager.getTables();
    
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe('users');
  });

  it('should return table schema', async () => {
    await SQLiteWasmManager.createEmpty();
    const schema = SQLiteWasmManager.getTableSchema('users');
    
    expect(schema).toHaveLength(2);
    expect(schema[0].name).toBe('id');
    expect(schema[1].name).toBe('name');
  });

  it('should export the database', async () => {
    await SQLiteWasmManager.createEmpty();
    const buffer = SQLiteWasmManager.exportDatabase();
    
    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(mockSqlite3.capi.sqlite3_serialize).toHaveBeenCalled();
  });
});
