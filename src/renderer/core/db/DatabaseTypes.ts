export interface DatabaseRow {
  [column: string]: string | number | null;
}

export interface QueryResult {
  columns: string[];
  values: any[][];
  rows: DatabaseRow[];
}

export interface DatabaseInterface {
  execute(sql: string): Promise<string>;
  query(sql: string): Promise<DatabaseRow[]>;
  bootstrap(): Promise<void>;
  close(): void;
}
