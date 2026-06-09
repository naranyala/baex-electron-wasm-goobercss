import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    padding: 40px 20px;
    font-family: 'Inter', sans-serif;
    max-width: 900px;
    margin: 0 auto;
    color: ${theme.subtitleColor};
  `,
  title: css`
    text-align: center;
    margin-bottom: 32px;
    font-size: 24px;
    font-weight: 700;
    color: ${theme.textColor};
  `,
  tableWrapper: css`
    overflow-x: auto;
    border: 1px solid ${theme.borderColor};
    border-radius: 8px;
    background: ${theme.backgroundColor};
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  `,
  th: css`
    padding: 12px 16px;
    background: ${theme.backgroundColor};
    color: ${theme.subtitleColor};
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s, color 0.2s;
    border-bottom: 2px solid ${theme.borderColor};
    &:hover {
      background: ${theme.hoverColor};
      color: ${theme.textColor};
    }
  `,
  td: css`
    padding: 12px 16px;
    border-bottom: 1px solid ${theme.borderColor};
    color: ${theme.subtitleColor};
    &:last-child { border-bottom: none; }
  `,
  sortIcon: css`
    display: inline-block;
    margin-left: 8px;
    font-size: 12px;
    color: ${theme.accentColor};
  `
};

export const DataTableView = defineComponent({
  name: 'data-table-view',
  initialState: {
    sortKey: null as string | null,
    sortDir: null as 'asc' | 'desc' | null,
    data: [
      { id: 1, name: 'Alice Johnson', role: 'Engineer', level: 4, joinDate: '2021-03-12' },
      { id: 2, name: 'Bob Smith', role: 'Designer', level: 3, joinDate: '2022-01-20' },
      { id: 3, name: 'Charlie Brown', role: 'Product', level: 5, joinDate: '2020-11-05' },
      { id: 4, name: 'Diana Prince', role: 'Engineer', level: 2, joinDate: '2023-06-15' },
      { id: 5, name: 'Edward Norton', role: 'QA', level: 4, joinDate: '2021-09-30' },
    ]
  },
  render: (state) => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'level', label: 'Level' },
      { key: 'joinDate', label: 'Joined' },
    ];

    const sortedData = [...state.data];
    if (state.sortKey && state.sortDir) {
      sortedData.sort((a, b) => {
        const valA = (a as any)[state.sortKey!];
        const valB = (b as any)[state.sortKey!];
        if (valA < valB) return state.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return state.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return html`
      <style>:host { display: block; }</style>
      <div class="${styles.container}">
        <h2 class="${styles.title}">Reactive Data Table</h2>
        <div class="${styles.tableWrapper}">
          <table class="${styles.table}">
            <thead>
              <tr>
                ${columns.map(col => `
                  <th class="${styles.th}" data-action="toggle-sort" data-key="${col.key}">
                    ${col.label}
                    <span class="${styles.sortIcon}">
                      ${state.sortKey === col.key ? (state.sortDir === 'asc' ? '▲' : state.sortDir === 'desc' ? '▼' : '↕') : '↕'}
                    </span>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(row => `
                <tr>
                  ${columns.map(col => `<td class="${styles.td}">${(row as any)[col.key]}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  events: {
    'click [data-action="toggle-sort"]': (e, { setState }) => {
      const target = e.currentTarget as HTMLElement;
      const key = target.getAttribute('data-key');
      if (!key) return;
      
      setState(s => {
        if (s.sortKey === key) {
          const nextDir = s.sortDir === 'asc' ? 'desc' : s.sortDir === 'desc' ? null : 'asc';
          return { sortKey: key, sortDir: nextDir } as any;
        }
        return { sortKey: key, sortDir: 'asc' } as any;
      });
    }
  }
});
