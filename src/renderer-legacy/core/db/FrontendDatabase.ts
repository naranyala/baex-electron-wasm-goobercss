import sqlite3Module from '@sqlite.org/sqlite-wasm';
import { DatabaseRow, DatabaseInterface } from './DatabaseTypes';

/**
 * An in-browser SQLite database implementation using the Origin Private File System (OPFS)
 * for persistent storage. Falls back to in-memory database if OPFS is unavailable.
 */
export class FrontendDatabase implements DatabaseInterface {
  private db: any = null;

  /**
   * Initializes the SQLite database.
   * 
   * @param {string} name - The name of the database file to create/open in OPFS.
   * @returns {Promise<void>}
   */
  async init(name: string = 'exba-app-db'): Promise<void> {
    const sqlite3 = await (sqlite3Module as any)();
    try {
      // The OPFS implementation of sqlite-wasm requires the 'sqlite3' global to be set 
      // or specifically passed. In newer versions of @sqlite.org/sqlite-wasm, 
      // OpfsDb is available on the returned module.
      if (sqlite3.oo1 && sqlite3.oo1.OpfsDb) {
        this.db = new sqlite3.oo1.OpfsDb(name);
        console.log(`SQLite OPFS database ${name} initialized successfully`);
      } else {
        throw new Error('OpfsDb constructor not found in sqlite3 module');
      }
    } catch (e) {
      console.warn('Failed to open OPFS database, falling back to in-memory:', e);
      this.db = new sqlite3.oo1.DB();
    }
  }

  /**
   * Executes a SQL command that does not return a result set (e.g., CREATE, INSERT).
   * 
   * @param {string} sql - The SQL statement to execute.
   * @returns {Promise<string>} Returns "Success" on successful execution.
   * @throws {Error} If the database is not initialized or execution fails.
   */
  async execute(sql: string): Promise<string> {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
    try {
      this.db.exec(sql);
      return 'Success';
    } catch (e: any) {
      throw new Error(`SQL Execution Error: ${e.message}`);
    }
  }

  /**
   * Executes a SQL query and returns the result as an array of rows.
   * 
   * @param {string} sql - The SQL query string.
   * @returns {Promise<DatabaseRow[]>} An array of row objects.
   * @throws {Error} If the database is not initialized or query fails.
   */
  async query(sql: string): Promise<DatabaseRow[]> {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
    try {
      const rows: Record<string, any>[] = this.db.exec(sql, {
        returnValue: 'resultRows',
        rowMode: 'object',
      });
      return rows.map((row: Record<string, any>) => {
        row.rowid = row.id ?? null;
        return row as DatabaseRow;
      });
    } catch (e: any) {
      throw new Error(`Query Error: ${e.message}`);
    }
  }

  /**
   * Seeds the database with initial tables and demo data.
   * Creates categories, users, products, orders, and order items.
   * 
   * @returns {Promise<void>}
   * @throws {Error} If the database is not initialized.
   */
  async bootstrap(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');

    const seedQueries = [
      `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`,
      `INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'Electronics')`,
      `INSERT OR IGNORE INTO categories (id, name) VALUES (2, 'Books')`,
      `INSERT OR IGNORE INTO categories (id, name) VALUES (3, 'Clothing')`,
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)`,
      `INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Alice Johnson', 'alice@example.com')`,
      `INSERT OR IGNORE INTO users (id, name, email) VALUES (2, 'Bob Smith', 'bob@example.com')`,
      `INSERT OR IGNORE INTO users (id, name, email) VALUES (3, 'Charlie Brown', 'charlie@example.com')`,
      `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL, category_id INTEGER, FOREIGN KEY(category_id) REFERENCES categories(id))`,
      `INSERT OR IGNORE INTO products (id, name, price, category_id) VALUES (1, 'Smartphone', 699.99, 1)`,
      `INSERT OR IGNORE INTO products (id, name, price, category_id) VALUES (2, 'Laptop', 1200.00, 1)`,
      `INSERT OR IGNORE INTO products (id, name, price, category_id) VALUES (3, 'Rust Programming Book', 45.00, 2)`,
      `INSERT OR IGNORE INTO products (id, name, price, category_id) VALUES (4, 'T-Shirt', 19.99, 3)`,
      `CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, user_id INTEGER, order_date TEXT, FOREIGN KEY(user_id) REFERENCES users(id))`,
      `INSERT OR IGNORE INTO orders (id, user_id, order_date) VALUES (1, 1, '${new Date().toISOString().split('T')[0]}')`,
      `INSERT OR IGNORE INTO orders (id, user_id, order_date) VALUES (2, 2, '${new Date().toISOString().split('T')[0]}')`,
      `CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(product_id) REFERENCES products(id))`,
      `INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity) VALUES (1, 1, 1, 1)`,
      `INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity) VALUES (2, 1, 3, 2)`,
      `INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity) VALUES (3, 2, 2, 1)`,
    ];
    for (const query of seedQueries) {
      this.db.exec(query);
    }
  }

  /**
   * Closes the database connection and releases resources.
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

let defaultInstance: FrontendDatabase | null = null;

/**
 * Provides a singleton instance of the FrontendDatabase.
 * Initializes and bootstraps the database on first call.
 * 
 * @returns {Promise<FrontendDatabase>} The initialized database instance.
 */
export async function getDatabase(): Promise<FrontendDatabase> {
  if (!defaultInstance) {
    defaultInstance = new FrontendDatabase();
    await defaultInstance.init();
    await defaultInstance.bootstrap();
  }
  return defaultInstance;
}

/**
 * Fetches the names of all user-created tables in the database.
 * 
 * @returns {Promise<string[]>} A list of table names.
 */
export async function fetchTables(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.query(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
  );
  return rows.map((r: any) => r.name);
}
