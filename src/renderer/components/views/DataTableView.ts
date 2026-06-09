import { css } from 'goober';

const styles = {
  container: css`
    padding: 40px 20px;
    font-family: 'Inter', sans-serif;
    max-width: 900px;
    margin: 0 auto;
    color: #c9d1d9;
  `,
  title: css`
    text-align: center;
    margin-bottom: 32px;
    font-size: 24px;
    font-weight: 700;
    color: #f0f6fc;
  `,
  tableWrapper: css`
    overflow-x: auto;
    border: 1px solid #30363d;
    border-radius: 12px;
    background: #161b22;
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  `,
  th: css`
    padding: 12px 16px;
    background: #21262d;
    color: #8b949e;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s, color 0.2s;
    border-bottom: 2px solid #30363d;
    &:hover {
      background: #30363d;
      color: #f0f6fc;
    }
  `,
  td: css`
    padding: 12px 16px;
    border-bottom: 1px solid #30363d;
    color: #c9d1d9;
    &:last-child { border-bottom: none; }
  `,
  sortIcon: css`
    display: inline-block;
    margin-left: 8px;
    font-size: 12px;
    color: #58a6ff;
  `
};

interface DataTableState {
  sortKey: string | null;
  sortDir: 'asc' | 'desc' | null;
  data: any[];
}

export const DataTableView = {
  name: 'data-table-view',
  initialState: {
    sortKey: null,
    sortDir: null,
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
        const valA = a[state.sortKey!];
        const valB = b[state.sortKey!];
        if (valA < valB) return state.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return state.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return `
      <style>:host { display: block; }</style>
      <div class="${styles.container}">
        <h2 class="${styles.title}">Reactive Data Table</h2>
        <div class="${styles.tableWrapper}">
          <table class="${styles.table}">
            <thead>
              <tr>
                ${columns.map(col => `
                  <th class="${styles.th}" onclick="this.getRootNode().host.toggleSort('${col.key}')">
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
                  ${columns.map(col => `<td class="${styles.td}">${row[col.key]}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  mounted: (el, state) => {
    (el as any).toggleSort = (key: string) => {
      el.setState((s: any) => {
        if (s.sortKey === key) {
          const nextDir = s.sortDir === 'asc' ? 'desc' : s.sortDir === 'desc' ? null : 'asc';
          return { sortDir: nextDir };
        }
        return { sortKey: key, sortDir: 'asc' };
      });
    };
  }
};
