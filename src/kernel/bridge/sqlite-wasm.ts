import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

/**
 * Manages the lifecycle and operations of the SQLite WASM engine on the frontend.
 * Provides methods for importing, querying, and exporting SQLite databases.
 */
export class SQLiteWasmManager {
  private static sqlite3: any = null;
  private static db: any = null;
  private static isInitializing = false;

  /**
   * Initializes the SQLite WASM module.
   * This is an idempotent operation; subsequent calls will return the existing instance.
   */
  static async init() {
    if (this.sqlite3) return this.sqlite3;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.sqlite3;
    }

    this.isInitializing = true;
    try {
      this.sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });
      console.log('[SQLite WASM] Initialized successfully');
      return this.sqlite3;
    } catch (e) {
      console.error('[SQLite WASM] Initialization failed:', e);
      throw e;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Imports a SQLite database from a binary buffer.
   * @param buffer The Uint8Array containing the database file content.
   */
  static async importDatabase(buffer: Uint8Array) {
    const sqlite3 = await this.init();
    
    // Close existing DB if open
    if (this.db) {
      this.db.close();
    }

    try {
      // We use a temporary file in the WASM virtual filesystem
      const p = sqlite3.wasm.allocFromTypedArray(buffer);
      this.db = new sqlite3.oo1.DB();
      
      // Deserialize the buffer into the database
      const rc = sqlite3.capi.sqlite3_deserialize(
        this.db.pointer,
        'main',
        p,
        buffer.byteLength,
        buffer.byteLength,
        sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE
      );

      if (rc !== 0) {
        throw new Error(`Failed to deserialize database (rc=${rc})`);
      }

      console.log('[SQLite WASM] Database imported successfully');
      return this.db;
    } catch (e) {
      console.error('[SQLite WASM] Import failed:', e);
      throw e;
    }
  }

  /**
   * Creates a new empty in-memory database.
   */
  static async createEmpty() {
    const sqlite3 = await this.init();
    if (this.db) this.db.close();
    this.db = new sqlite3.oo1.DB(':memory:');
    return this.db;
  }

  /**
   * Executes a SQL query and returns the results.
   * @param sql The SQL string to execute.
   * @param bind Optional bind parameters.
   */
  static execute(sql: string, bind: any[] = []) {
    if (!this.db) throw new Error('No database loaded');
    
    const rows: any[] = [];
    this.db.exec({
      sql,
      bind,
      rowMode: 'object',
      callback: (row: any) => {
        rows.push(row);
      }
    });
    return rows;
  }

  /**
   * Exports the current database to a Uint8Array.
   */
  static exportDatabase(): Uint8Array {
    if (!this.db) throw new Error('No database loaded');
    
    // For oo1.DB, we can use the serialization API
    const sqlite3 = this.sqlite3;
    const pSize = sqlite3.wasm.alloc(8); // To hold the size
    const pData = sqlite3.capi.sqlite3_serialize(this.db.pointer, 'main', pSize, 0);
    
    if (!pData) throw new Error('Failed to serialize database');

    const size = sqlite3.wasm.getPtrValue(pSize, 'i64');
    const result = new Uint8Array(sqlite3.wasm.heapU8().buffer, pData, Number(size)).slice();
    
    sqlite3.capi.sqlite3_free(pData);
    sqlite3.wasm.free(pSize);

    return result;
  }

  /**
   * Returns the list of tables in the current database.
   */
  static getTables() {
    return this.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  }

  /**
   * Returns the schema for a specific table.
   */
  static getTableSchema(tableName: string) {
    return this.execute(`PRAGMA table_info(${tableName})`);
  }

  /**
   * Checks if a database is currently loaded.
   */
  static hasDatabase() {
    return this.db !== null;
  }
}
