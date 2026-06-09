import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { dbService, sqlUtils } from '../../services/DbService.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  `,
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  title: css`
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  badge: css`
    font-size: 0.75rem;
    color: ${theme.subtitleColor};
    background: #1f1f23;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid ${theme.borderColor};
  `,
  splitPanel: css`
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  `,
  tableContainer: css`
    flex: 1;
    overflow-x: auto;
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
  `,
  th: css`
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid ${theme.borderColor};
    color: ${theme.subtitleColor};
    font-weight: 500;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: left;
  `,
  td: css`
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #1f1f23;
    color: ${theme.textColor};
  `,
  trEditing: css`
    background: rgba(99, 102, 241, 0.06);
    transition: background 0.12s ease;
  `,
  formPanel: css`
    width: 300px;
    padding: 1.25rem;
    background: ${theme.backgroundColor};
    border: 1px solid ${theme.borderColor};
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `,
  formHeader: css`
    font-size: 0.875rem;
    font-weight: 600;
    color: ${theme.textColor};
    padding-bottom: 0.75rem;
    border-bottom: 1px solid ${theme.borderColor};
  `,
  formField: css`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.8125rem;
  `,
  formInput: css`
    padding: 0.4rem 0.6rem;
    background: #0d1117;
    border: 1px solid ${theme.borderColor};
    color: ${theme.textColor};
    border-radius: 4px;
    outline: none;
    &:focus { border-color: ${theme.accentColor}; }
  `,
  formActions: css`
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  `
};

export const TableView = defineComponent({
  name: 'table-view',
  initialState: {
    tableName: '',
    data: [] as any[],
    loading: false,
    error: '' as string | null,
    editingRowId: null as number | null,
    formValues: {} as any,
  },
  events: {
    'click [data-action="add"]': async (_e: Event, { state, setState }: any) => {
      const columns = Object.keys(state.data[0] || {}).filter(c => c !== 'rowid');
      const values = columns.map(col => prompt(`Value for ${col}:`) || '');
      const colsStr = columns.join(', ');
      const valsStr = values.map(v => `'${sqlUtils.escape(v)}'`).join(', ');
      await dbService.executeAction(`INSERT INTO ${state.tableName} (${colsStr}) VALUES (${valsStr})`);
      const data = await dbService.getTableData(state.tableName);
      setState(() => ({ data }));
    },
    'click [data-action="delete"]': async (e: Event, { state, setState }: any) => {
      const id = (e.target as HTMLElement).dataset.id;
      if (!confirm(`Delete row with ID ${id}?`)) return;
      await dbService.executeAction(`DELETE FROM ${state.tableName} WHERE rowid = ${id}`);
      const data = await dbService.getTableData(state.tableName);
      setState(() => ({ data }));
    },
    'click [data-action="edit"]': (e: Event, { state, setState }: any) => {
      const id = parseInt((e.target as HTMLElement).dataset.id || '0');
      const row = state.data.find((r: any) => r.rowid === id);
      if (row) {
        setState(() => ({ editingRowId: id, formValues: { ...row } }));
      }
    },
    'click [data-action="submit"]': async (_e: Event, { state, setState }: any) => {
      const updates = Object.entries(state.formValues)
        .filter(([k]) => k !== 'rowid')
        .map(([k, v]) => `${k} = '${sqlUtils.escape(v as string)}'`);
      await dbService.executeAction(`UPDATE ${state.tableName} SET ${updates.join(', ')} WHERE rowid = ${state.editingRowId}`);
      const data = await dbService.getTableData(state.tableName);
      setState(() => ({ data, editingRowId: null }));
    },
    'click [data-action="cancel"]': (_e: Event, { setState }: any) => {
      setState(() => ({ editingRowId: null }));
    },
    'input .form-input': (e: Event, { state, setState }: any) => {
      const target = e.target as HTMLInputElement;
      const col = target.dataset.col;
      if (col) {
        setState(() => ({ formValues: { ...state.formValues, [col]: target.value } }));
      }
    }
  },
  render: (state) => {
    if (state.loading) return html`<div style="text-align: center; padding: 3rem; color: ${theme.subtitleColor}; font-size: 0.875rem;">Loading table ${state.tableName}...</div>`;
    if (state.error) return html`<div style="color: #ef4444; padding: 3rem; text-align: center; font-size: 0.875rem;">Error: ${state.error}</div>`;
    if (state.data.length === 0) return html`<div style="padding: 3rem; text-align: center; color: ${theme.subtitleColor}; font-size: 0.875rem;">Table ${state.tableName} is empty.</div>`;

    const columns = Object.keys(state.data[0]).filter(c => c !== 'rowid');
    
    const tableHtml = html`
      <div style="overflow-x: auto;">
        <table class="${styles.table}">
          <thead>
            <tr style="text-align: left;">
              ${columns.map(col => `<th class="${styles.th}">${col}</th>`).join('')}
              <th class="${styles.th}" style="text-align: center; width: 9rem;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.map((row: any) => `
              <tr class="${state.editingRowId === row.rowid ? styles.trEditing : ''}">
                ${columns.map(col => `<td class="${styles.td}">${row[col]}</td>`).join('')}
                <td class="${styles.td}" style="text-align: center; white-space: nowrap;">
                  <button class="${theme.crudButton}" data-action="edit" data-id="${row.rowid}">Edit</button>
                  <button class="${theme.crudButton}" style="margin-left: 0.375rem;" data-action="delete" data-id="${row.rowid}">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    const formHtml = html`
      <div class="${styles.formPanel}">
        <div class="${styles.formHeader}">Edit Row</div>
        <div style="display: flex; flex-direction: column; gap: 0.875rem;">
          ${columns.map(col => `
            <div class="${styles.formField}">
              <label>${col}</label>
              <input type="text" value="${state.formValues[col] || ''}" 
                     data-col="${col}" class="${styles.formInput}" />
            </div>
          `).join('')}
        </div>
        <div class="${styles.formActions}">
          <button class="${theme.addButton}" style="margin: 0; flex: 1; font-size: 0.8125rem;" data-action="submit">Save</button>
          <button class="${theme.crudButton}" style="flex: 1; text-align: center;" data-action="cancel">Cancel</button>
        </div>
      </div>
    `;
    
    return html`
      <div class="${styles.container}">
        <div class="${styles.header}">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h2 class="${styles.title}">${state.tableName}</h2>
            <span class="${styles.badge}">${state.data.length} rows</span>
          </div>
          <button class="${theme.addButton}" style="margin: 0;" data-action="add">＋ Add Row</button>
        </div>
        <div class="${styles.splitPanel}">
          <div class="${styles.tableContainer}">
            ${tableHtml}
          </div>
          ${state.editingRowId ? formHtml : ''}
        </div>
      </div>
    `;
  }
});
