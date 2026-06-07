import sqlite3Module from '@sqlite.org/sqlite-wasm';
import { DatabaseRow, DatabaseInterface } from './DatabaseTypes';

export class FrontendDatabase implements DatabaseInterface {
  private db: any = null;

  async init(name: string = 'baex-app-db'): Promise<void> {
    const sqlite3 = await (sqlite3Module as any)();
    try {
      // Official SQLite WASM OPFS open
      this.db = await sqlite3.opfs.open(name);
      console.log(`SQLite OPFS database ${name} initialized successfully`);
    } catch (e) {
      console.error('Failed to open OPFS database, falling back to in-memory:', e);
      this.db = new sqlite3.oo1.DB();
    }
  }

  async execute(sql: string): Promise<string> {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
    try {
      this.db.exec(sql);
      return 'Success';
    } catch (e: any) {
      throw new Error(`SQL Execution Error: ${e.message}`);
    }
  }

  async query(sql: string): Promise<DatabaseRow[]> {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
    try {
      const results = this.db.exec(sql);
      // The official build returns an array of result sets
      if (!results || results.length === 0) return [];
      
      const { columns, values } = results[0];
      return values.map((row: any[]) => {
        const obj: DatabaseRow = {};
        columns.forEach((col: string, i: number) => {
          obj[col] = row[i] ?? null;
        });
        // Ensure rowid is always present for the framework's CRUD
        obj.rowid = obj.id ?? (row[0] || null);
        return obj;
      });
    } catch (e: any) {
      throw new Error(`Query Error: ${e.message}`);
    }
  }

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

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

let defaultInstance: FrontendDatabase | null = null;

export async function getDatabase(): Promise<FrontendDatabase> {
  if (!defaultInstance) {
    defaultInstance = new FrontendDatabase();
    await defaultInstance.init();
    await defaultInstance.bootstrap();
  }
  return defaultInstance;
}

export async function fetchTables(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.query(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
  );
  return rows.map((r: any) => r.name);
}
