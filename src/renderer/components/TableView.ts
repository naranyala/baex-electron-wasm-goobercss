import { dbService, sqlUtils } from '../services/DbService.js';
import { addButton, crudButton, formPanel, formField, formActions, splitPanel, tableContainer } from '../styles/theme.js';

export const TableView = {
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
    'click [data-action="add"]': async (_e: Event, state: any) => {
      const columns = Object.keys(state.data[0] || {}).filter(c => c !== 'rowid');
      const values = columns.map(col => prompt(`Value for ${col}:`) || '');
      const colsStr = columns.join(', ');
      const valsStr = values.map(v => `'${sqlUtils.escape(v)}'`).join(', ');
      await dbService.executeAction(`INSERT INTO ${state.tableName} (${colsStr}) VALUES (${valsStr})`);
      state.data = await dbService.getTableData(state.tableName);
    },
    'click [data-action="delete"]': async (e: Event, state: any) => {
      const id = (e.target as HTMLElement).dataset.id;
      if (!confirm(`Delete row with ID ${id}?`)) return;
      await dbService.executeAction(`DELETE FROM ${state.tableName} WHERE rowid = ${id}`);
      state.data = await dbService.getTableData(state.tableName);
    },
    'click [data-action="edit"]': (e: Event, state: any) => {
      const id = parseInt((e.target as HTMLElement).dataset.id || '0');
      const row = state.data.find((r: any) => r.rowid === id);
      if (row) {
        state.editingRowId = id;
        state.formValues = { ...row };
      }
    },
    'click [data-action="submit"]': async (_e: Event, state: any) => {
      const updates = Object.entries(state.formValues)
        .filter(([k]) => k !== 'rowid')
        .map(([k, v]) => `${k} = '${sqlUtils.escape(v as string)}'`);
      await dbService.executeAction(`UPDATE ${state.tableName} SET ${updates.join(', ')} WHERE rowid = ${state.editingRowId}`);
      state.data = await dbService.getTableData(state.tableName);
      state.editingRowId = null;
    },
    'click [data-action="cancel"]': (_e: Event, state: any) => {
      state.editingRowId = null;
    },
    'input .form-input': (e: Event, state: any) => {
      const target = e.target as HTMLInputElement;
      const col = target.dataset.col;
      if (col) {
        state.formValues[col] = target.value;
      }
    }
  },
  render: (state: any) => {
    if (state.loading) return `<div style="text-align: center; padding: 3rem; color: #6b6b7b; font-size: 0.875rem;">Loading table ${state.tableName}...</div>`;
    if (state.error) return `<div style="color: #ef4444; padding: 3rem; text-align: center; font-size: 0.875rem;">Error: ${state.error}</div>`;
    if (state.data.length === 0) return `<div style="padding: 3rem; text-align: center; color: #6b6b7b; font-size: 0.875rem;">Table ${state.tableName} is empty.</div>`;

    const columns = Object.keys(state.data[0]).filter(c => c !== 'rowid');
    const tableHtml = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
          <thead>
            <tr style="text-align: left;">
              ${columns.map(col => `<th style="padding: 0.625rem 0.75rem; border-bottom: 1px solid #2a2a30; color: #6b6b7b; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em;">${col}</th>`).join('')}
              <th style="padding: 0.625rem 0.75rem; border-bottom: 1px solid #2a2a30; color: #6b6b7b; font-weight: 500; font-size: 0.75rem; text-align: center; width: 9rem;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.map((row: any) => `
              <tr style="${state.editingRowId === row.rowid ? 'background: rgba(99, 102, 241, 0.06);' : ''} transition: background 0.12s ease;">
                ${columns.map(col => `<td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #1f1f23; color: #f4f4f5;">${row[col]}</td>`).join('')}
                <td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #1f1f23; text-align: center; white-space: nowrap;">
                  <button class="${crudButton}" data-action="edit" data-id="${row.rowid}">Edit</button>
                  <button class="${crudButton}" style="margin-left: 0.375rem;" data-action="delete" data-id="${row.rowid}">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const formHtml = `
      <div class="${formPanel}">
        <div style="font-size: 0.875rem; font-weight: 600; color: #f4f4f5; padding-bottom: 0.75rem; border-bottom: 1px solid #2a2a30;">Edit Row</div>
        <div style="display: flex; flex-direction: column; gap: 0.875rem;">
          ${columns.map(col => `
            <div class="${formField}">
              <label>${col}</label>
              <input type="text" value="${state.formValues[col] || ''}" 
                data-col="${col}" class="form-input" />
            </div>
          `).join('')}
        </div>
        <div class="${formActions}">
          <button class="${addButton}" style="margin: 0; flex: 1; font-size: 0.8125rem;" data-action="submit">Save</button>
          <button class="${crudButton}" style="flex: 1; text-align: center;" data-action="cancel">Cancel</button>
        </div>
      </div>
    `;

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h2 style="margin: 0; font-size: 1.125rem; font-weight: 600; letter-spacing: -0.01em; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${state.tableName}</h2>
          <span style="font-size: 0.75rem; color: #6b6b7b; background: #1f1f23; padding: 0.125rem 0.5rem; border-radius: 0.25rem; border: 1px solid #2a2a30;">${state.data.length} rows</span>
        </div>
        <button class="${addButton}" style="margin: 0;" data-action="add">＋ Add Row</button>
      </div>
      <div class="${splitPanel}">
        <div class="${tableContainer}">
          ${tableHtml}
        </div>
        ${state.editingRowId ? formHtml : ''}
      </div>
    `;
  },
  mounted: (_el: any, _state: any) => {}
};
