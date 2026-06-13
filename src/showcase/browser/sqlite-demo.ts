import { ExbaComponent } from '../../kernel/core/component';
import { customElement, state } from '../../kernel/core/decorators';
import { SQLiteWasmManager } from '../../kernel/bridge/sqlite-wasm';
import { styles as globalStyles } from '../../shell/styles';
import { createToggle, createArray } from '../../kernel/helpers';
import { html } from '../../kernel/core/dom';

/**
 * A comprehensive SQLite database browser and editor.
 * Demonstrates frontend SQLite integration using WASM.
 */
@customElement('exba-sqlite-demo')
export class SQLiteDemo extends ExbaComponent {
  // Reactive state using EXBA signals
  private tables = createArray<{ name: string }>([]);
  private currentTable = createToggle(false); // Used as a simple signal for selection
  private activeTableName = '';
  private tableData = createArray<any>([]);
  private tableColumns = createArray<string>([]);
  private isLoaded = createToggle(false);

  static styles = {
    container: 'display: grid; grid-template-columns: 240px 1fr; height: 100%; background: #09090b; color: #e4e4e7;',
    sidebar: 'border-right: 1px solid #27272a; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;',
    main: 'padding: 1.5rem; overflow: auto; display: flex; flex-direction: column; gap: 1.5rem;',
    tableList: 'list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;',
    tableItem: 'padding: 0.5rem 0.75rem; border-radius: 0.375rem; cursor: pointer; transition: background 0.2s; font-size: 0.875rem;',
    tableItemActive: 'background: #3f3f46; color: white; font-weight: 500;',
    tableItemHover: 'hover { background: #27272a; }',
    btn: 'padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid #3f3f46; background: #18181b; color: #e4e4e7; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;',
    btnPrimary: 'background: #6366f1; border-color: #4f46e5; color: white;',
    grid: 'width: 100%; border-collapse: collapse; font-size: 0.875rem; border: 1px solid #27272a;',
    th: 'text-align: left; padding: 0.75rem; border-bottom: 2px solid #27272a; background: #18181b; font-weight: 600; color: #a1a1aa;',
    td: 'padding: 0.75rem; border-bottom: 1px solid #27272a;',
    emptyState: 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #71717a; text-align: center; gap: 1rem;',
    fileInput: 'display: none;'
  };

  render() {
    const styles = SQLiteDemo.styles;
    
    if (!this.isLoaded.value) {
      return `
        <div class="${styles.emptyState}">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M20 12H4"/></svg>
          <div>
            <h3 style="color: white; margin-bottom: 0.5rem;">SQLite Browser</h3>
            <p>Import a database file to start editing data on the frontend.</p>
          </div>
          <button id="import-trigger" class="${styles.btn} ${styles.btnPrimary}">Import .db / .sqlite</button>
          <input type="file" id="file-input" class="${styles.fileInput}" accept=".db,.sqlite,.sqlite3">
        </div>
      `;
    }

    return `
      <div class="${styles.container}">
        <div class="${styles.sidebar}">
          <h4 style="margin: 0; color: #a1a1aa; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Tables</h4>
          <ul class="${styles.tableList}">
            ${this.tables.value.map(t => `
              <li class="${styles.tableItem} ${t.name === this.activeTableName ? styles.tableItemActive : ''}" 
                  onclick="this.getRootNode().host.selectTable('${t.name}')">
                ${t.name}
              </li>
            `).join('')}
          </ul>
          <div style="margin-top: auto; display: flex; flex-direction: column; gap: 0.5rem;">
            <button id="export-db" class="${styles.btn}">Export Database</button>
            <button id="new-db" class="${styles.btn}">Reset</button>
          </div>
        </div>
        <div class="${styles.main}">
          ${this.activeTableName ? `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="margin: 0; font-size: 1.25rem;">Table: ${this.activeTableName}</h2>
              <button class="${styles.btn}" onclick="this.getRootNode().host.addRow()">+ Add Row</button>
            </div>
            <div style="overflow-x: auto;">
              <table class="${styles.grid}">
                <thead>
                  <tr>
                    ${this.tableColumns.value.map(col => `<th class="${styles.th}">${col}</th>`).join('')}
                    <th class="${styles.th}" style="width: 50px;"></th>
                  </tr>
                </thead>
                <tbody>
                  ${this.tableData.value.map((row, idx) => `
                    <tr>
                      ${this.tableColumns.value.map(col => `
                        <td class="${styles.td}">
                          <input type="text" value="${row[col] || ''}" 
                                 style="background: transparent; border: none; color: inherit; width: 100%; outline: none;"
                                 onchange="this.getRootNode().host.updateCell('${this.activeTableName}', ${idx}, '${col}', this.value)">
                        </td>
                      `).join('')}
                      <td class="${styles.td}">
                        <span style="color: #ef4444; cursor: pointer;" onclick="this.getRootNode().host.deleteRow(${idx})">✕</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="${styles.emptyState}">
              <p>Select a table from the sidebar to view and edit its contents.</p>
            </div>
          `}
        </div>
      </div>
      <input type="file" id="file-input" class="${styles.fileInput}" accept=".db,.sqlite,.sqlite3">
    `;
  }

  protected onMount() {
    this.attachListeners();
  }

  protected onUpdate() {
    this.attachListeners();
  }

  private attachListeners() {
    const importTrigger = this.shadowRoot?.getElementById('import-trigger');
    const fileInput = this.shadowRoot?.getElementById('file-input') as HTMLInputElement;
    const exportBtn = this.shadowRoot?.getElementById('export-db');
    const resetBtn = this.shadowRoot?.getElementById('new-db');

    importTrigger?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => this.handleFileImport(e));
    exportBtn?.addEventListener('click', () => this.handleExport());
    resetBtn?.addEventListener('click', () => {
      this.isLoaded.off();
      this.tables.clear();
      this.activeTableName = '';
    });
  }

  private async handleFileImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = new Uint8Array(event.target?.result as ArrayBuffer);
      await SQLiteWasmManager.importDatabase(buffer);
      this.isLoaded.on();
      this.refreshTables();
    };
    reader.readAsArrayBuffer(file);
  }

  private refreshTables() {
    const tableList = SQLiteWasmManager.getTables();
    this.tables.clear();
    tableList.forEach(t => this.tables.push(t));
  }

  public selectTable(name: string) {
    this.activeTableName = name;
    const schema = SQLiteWasmManager.getTableSchema(name);
    this.tableColumns.clear();
    schema.forEach((col: any) => this.tableColumns.push(col.name));

    const data = SQLiteWasmManager.execute(`SELECT * FROM ${name}`);
    this.tableData.clear();
    data.forEach(row => this.tableData.push(row));
    
    this.safeUpdate();
  }

  public updateCell(table: string, rowIndex: number, column: string, value: string) {
    const row = this.tableData.value[rowIndex];
    // This is a simple demo; in real app we'd use primary keys
    // Assuming the first column is the ID or similar for demonstration
    const idCol = this.tableColumns.value[0];
    const idVal = row[idCol];

    try {
      SQLiteWasmManager.execute(
        `UPDATE ${table} SET ${column} = ? WHERE ${idCol} = ?`,
        [value, idVal]
      );
      console.log(`[SQLite] Updated ${table}.${column} for ${idCol}=${idVal}`);
      
      // Update local state to keep UI in sync
      const newData = [...this.tableData.value];
      newData[rowIndex][column] = value;
      this.tableData.clear();
      newData.forEach(r => this.tableData.push(r));
    } catch (e) {
      console.error('[SQLite] Update failed:', e);
      alert('Update failed: ' + (e as Error).message);
    }
  }

  public async deleteRow(idx: number) {
    const table = this.activeTableName;
    const row = this.tableData.value[idx];
    const idCol = this.tableColumns.value[0];
    const idVal = row[idCol];

    if (!confirm(`Delete row where ${idCol} = ${idVal}?`)) return;

    try {
      SQLiteWasmManager.execute(`DELETE FROM ${table} WHERE ${idCol} = ?`, [idVal]);
      this.selectTable(table); // Refresh
    } catch (e) {
      console.error('[SQLite] Delete failed:', e);
    }
  }

  public addRow() {
    const table = this.activeTableName;
    try {
      SQLiteWasmManager.execute(`INSERT INTO ${table} DEFAULT VALUES`);
      this.selectTable(table); // Refresh
    } catch (e) {
      // If DEFAULT VALUES not supported or constraints fail, try empty insert
      try {
        const cols = this.tableColumns.value.filter(c => c !== 'id').join(', ');
        const placeholders = this.tableColumns.value.filter(c => c !== 'id').map(() => 'NULL').join(', ');
        SQLiteWasmManager.execute(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`);
        this.selectTable(table);
      } catch (e2) {
        alert('Could not add empty row: ' + (e2 as Error).message);
      }
    }
  }

  private handleExport() {
    const buffer = SQLiteWasmManager.exportDatabase();
    const blob = new Blob([buffer as any], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.activeTableName ? `${this.activeTableName}.db` : 'database.db';
    a.click();
    URL.revokeObjectURL(url);
  }
}
