import { getDatabase, FrontendDatabase } from '../framework/FrontendDatabase';
import { DatabaseRow } from '../framework/DatabaseTypes';

// Pure Data Transformers
export const sqlUtils = {
  toRowObjects: (results: any[]): DatabaseRow[] => {
    if (!results || results.length === 0) return [];
    const { columns, values } = results[0];
    return values.map((row: any[]) => {
      const obj: DatabaseRow = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i] ?? null;
      });
      obj.rowid = obj.id ?? (row[0] || null);
      return obj;
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
      const rows = await db.query(sql);
      return sqlUtils.toRowObjects(rows);
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
