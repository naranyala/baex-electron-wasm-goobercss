import { getDatabase, FrontendDatabase } from '../core/db/FrontendDatabase';
import { DatabaseRow } from '../core/db/DatabaseTypes';

// Pure Data Transformers
export const sqlUtils = {
  toRowObjects: (rows: Record<string, any>[]): DatabaseRow[] => {
    return rows.map((row) => {
      row.rowid = row.id ?? null;
      return row as DatabaseRow;
    });
  },
  escape: (val: string) => val.replace(/'/g, "''"),
};

export class DbService {
  private async getDb(): Promise<FrontendDatabase> {
    return await getDatabase();
  }

  // --- Procedural API (Imperative) ---

  async fetchTables(): Promise<string[]> {
    const db = await this.getDb();
    const rows = await db.query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    return rows.map((r: any) => r.name);
  }

  async getTableData(tableName: string): Promise<DatabaseRow[]> {
    const db = await this.getDb();
    return await db.query(`SELECT rowid, * FROM ${tableName}`);
  }

  async executeAction(sql: string): Promise<void> {
    await this.execute(sql);
  }

  async execute(sql: string): Promise<void> {
    const db = await this.getDb();
    await db.execute(sql);
  }

  async query(sql: string): Promise<DatabaseRow[]> {
    const db = await this.getDb();
    return await db.query(sql);
  }

  // --- Functional API (Composable) ---

  /**
   * Returns a function that can be used in a functional pipe to execute a query
   */
  queryPipe(sql: string) {
    return async () => {
      const db = await this.getDb();
      return await db.query(sql);
    };
  }

  /**
   * Returns a function that can be used in a functional pipe to execute an action
   */
  actionPipe(sql: string) {
    return async () => {
      const db = await this.getDb();
      await db.execute(sql);
      return true;
    };
  }
}

export const dbService = new DbService();
