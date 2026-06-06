import './style.css'
import './components/tab-bar.js'
import { css, setup } from 'goober';
import { WasmBridge } from './framework/WasmBridge.js';
import { defineComponent } from './framework/Component.js';
import init from '../../core/rust/pkg/wasm_rust.js';
import embed from 'vega-embed';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

setup(null);

// Define a MapView component for Leaflet integration
defineComponent({
  name: 'map-view',
  initialState: {
    center: [51.505, -0.09],
    zoom: 13,
    title: 'World Map'
  },
  render: (state) => `
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; height: 80vh;">
      <h2 style="margin: 0; color: #6366f1; font-family: monospace;">${state.title}</h2>
      <div id="leaflet-map" style="flex: 1; border-radius: 1rem; border: 1px solid #3f3f46; background: #27272a; min-height: 400px;"></div>
      <div style="font-family: monospace; font-size: 0.875rem; color: #a1a1aa; text-align: center;">
        Leaflet.js Integration: Spatial data visualization layer.
      </div>
    </div>
  `,
  mounted: (el, state) => {
    const mapEl = el.shadowRoot?.getElementById('leaflet-map');
    if (!mapEl) return;
    
    const map = L.map(mapEl).setView(state.center, state.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.marker(state.center).addTo(map)
      .bindPopup('BAEX Spatial Node')
      .openPopup();
    
    setTimeout(() => map.invalidateSize(), 100);
  }
});

// Define a ChartView component for Vega integration
defineComponent({
  name: 'chart-view',
  initialState: {
    chartType: 'bar',
    data: [
      { category: 'Wasm', value: 45 },
      { category: 'Rust', value: 80 },
      { category: 'TS', value: 60 },
      { category: 'C++', value: 30 },
    ]
  },
  render: (state) => `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem;">
      <h2 style="margin: 0; color: #6366f1;">BAEX Performance Metrics</h2>
      <div id="vega-chart" style="width: 100%; max-width: 600px; background: #27272a; padding: 1rem; border-radius: 1rem; border: 1px solid #3f3f46;"></div>
      <div style="font-family: monospace; font-size: 0.875rem; color: #a1a1aa; text-align: center;">
        Vega-Lite Integration: Rendering data directly from WasmBridge state.
      </div>
    </div>
  `,
  mounted: (el, state) => {
    const chartSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'A simple bar chart with embedded data.',
      data: { values: state.data },
      mark: 'bar',
      encoding: {
        x: { field: 'category', type: 'nominal', axis: { labelColor: 'white', titleColor: 'white' } },
        y: { field: 'value', type: 'quantitative', axis: { labelColor: 'white', titleColor: 'white' } },
        color: { value: '#6366f1' }
      },
      config: {
        background: 'transparent',
        axis: { gridColor: '#3f3f46' }
      }
    };
    
    // Since we use shadow DOM, we need to find the element inside the shadow root
    const chartEl = el.shadowRoot?.getElementById('vega-chart');
    if (chartEl) {
      embed(chartEl, chartSpec, { actions: false }).catch(console.error);
    }
  }
});

// Define a TableView component using our new simple model
defineComponent({
  name: 'table-view',
  initialState: {
    tableName: '',
    data: [] as any[],
    loading: false,
    error: '' as string | null,
    editingRowId: null as number | null,
    formValues: {} as any,
  },
  render: (state, { setState }) => {
    if (state.loading) return `<div style="text-align: center; padding: 2rem;">Loading table ${state.tableName}...</div>`;
    if (state.error) return `<div style="color: #ef4444; padding: 2rem;">Error: ${state.error}</div>`;
    if (state.data.length === 0) return `<div style="padding: 2rem; text-align: center;">Table ${state.tableName} is empty.</div>`;

    const columns = Object.keys(state.data[0]).filter(c => c !== 'rowid');
    
    const tableHtml = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 0.875rem;">
          <thead>
            <tr style="background: #27272a; text-align: left;">
              ${columns.map(col => `<th style="padding: 0.75rem; border: 1px solid #3f3f46; color: #a1a1aa;">${col}</th>`).join('')}
              <th style="padding: 0.75rem; border: 1px solid #3f3f46; color: #a1a1aa; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.map(row => `
              <tr style="${state.editingRowId === row.rowid ? 'background: rgba(99, 102, 241, 0.1);' : ''}">
                ${columns.map(col => `<td style="padding: 0.75rem; border: 1px solid #3f3f46; color: #f4f4f5;">${row[col]}</td>`).join('')}
                <td style="padding: 0.75rem; border: 1px solid #3f3f46; text-align: center; white-space: nowrap;">
                  <button class="${crudButton}" onclick="window.handleEditRow('${state.tableName}', ${row.rowid})">Edit</button>
                  <button class="${crudButton}" style="color: #ef4444;" onclick="window.handleDeleteRow('${state.tableName}', ${row.rowid})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const formHtml = `
      <div class="${formPanel}">
        <h3>Edit Row</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${columns.map(col => `
            <div class="${formField}">
              <label>${col}</label>
              <input type="text" value="${state.formValues[col] || ''}" 
                oninput="window.handleFormInput('${col}', this.value)" />
            </div>
          `).join('')}
        </div>
        <div class="${formActions}">
          <button class="${addButton}" style="margin: 0; flex: 1;" onclick="window.handleFormSubmit('${state.tableName}', ${state.editingRowId})">Save</button>
          <button class="${crudButton}" style="flex: 1;" onclick="window.handleCancelEdit()">Cancel</button>
        </div>
      </div>
    `;

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="margin: 0;">Table: ${state.tableName}</h2>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="opacity: 0.6">${state.data.length} rows</span>
          <button class="${addButton}" style="margin: 0;" onclick="window.handleAddRow('${state.tableName}', ${JSON.stringify(columns)})">＋ Add Row</button>
        </div>
      </div>
      <div class="${splitPanel}">
        <div class="${tableContainer}">
          ${tableHtml}
        </div>
        ${state.editingRowId ? formHtml : ''}
      </div>
    `;
  }
});

// Styles
const navBar = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background-color: #18181b;
  border-bottom: 1px solid #3f3f46;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 1rem;
  z-index: 100;
`;

const homeButton = css`
  background: #3f3f46;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  &:hover { background: #52525b; }
`;

const appContainer = css`
  min-height: 100vh;
  background-color: #18181b;
  color: #f4f4f5;
  padding: 0;
  padding-top: 4rem;
  font-size: 1.1rem;
`;

const contentWrapper = css`
  width: 100%;
  max-width: 50rem;
  margin: 0 auto;
  padding: 1.5rem;
`;

const searchAndLogWrapper = css`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const searchInput = css`
  width: 100%;
  max-width: 28rem;
  padding: 0.75rem 1rem;
  font-size: 1.125rem;
  border-radius: 0.75rem;
  border: 2px solid #3f3f46;
  background-color: #27272a;
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: #6366f1;
  }
`;

const sectionContainer = css`
  border: 1px solid #3f3f46;
  border-radius: 1rem;
  overflow: hidden;
  background-color: rgba(39, 39, 42, 0.5);
`;

const menuGrid = css`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
`;

const menuItem = css`
  aspect-ratio: 1;
  padding: 0.5rem;
  background-color: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 500;
`;

const statusBar = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.5rem;
  background-color: #18181b;
  border-top: 1px solid #3f3f46;
  color: #a1a1aa;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  z-index: 100;
  font-family: monospace;
  cursor: pointer;
  &:hover { background-color: #27272a; }
`;

const modalBackdrop = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const modalContent = css`
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 1rem;
  width: 90%;
  max-width: 40rem;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
`;

const modalSearch = css`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 0.5rem;
  color: white;
  outline: none;
  &:focus { border-color: #6366f1; }
`;

const modalList = css`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const crudButton = css`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  border: 1px solid #3f3f46;
  background: #27272a;
  color: #a1a1aa;
  margin-left: 0.5rem;
  &:hover { background: #3f3f46; color: white; }
`;

const addButton = css`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 0.5rem;
  border: 1px solid #6366f1;
  background: #6366f1;
  color: white;
  margin-bottom: 1rem;
  font-weight: 500;
  &:hover { background: #4f46e5; }
`;

const splitPanel = css`
  display: flex;
  gap: 1rem;
  height: calc(100vh - 10rem);
`;

const tableContainer = css`
  flex: 1;
  overflow: auto;
  border: 1px solid #3f3f46;
  border-radius: 0.5rem;
  background: #18181b;
`;

const formPanel = css`
  width: 25rem;
  padding: 1.5rem;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

const formField = css`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  label { font-size: 0.75rem; color: #a1a1aa; font-family: monospace; }
  input { 
    padding: 0.5rem; 
    background: #18181b; 
    border: 1px solid #3f3f46; 
    color: white; 
    border-radius: 0.25rem; 
    font-family: monospace; 
    &:focus { border-color: #6366f1; outline: none; }
  }
`;

const formActions = css`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

// Application State
const tabs = new Map();
let activeTabId: string | null = null;

async function fetchTables() {
  try {
    console.log('Fetching tables from SQLite...');
    const tables = await (window as any).ipcRenderer.db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    console.log('Received tables:', tables);
    return tables.map((t: any) => t.name);
  } catch (e) {
    console.error("Failed to fetch tables:", e);
    throw e; // Rethrow so the UI can handle it
  }
}

async function renderTableContent(tableName: string) {
  const view = document.getElementById('dynamic-view');
  if (!view) return;

  view.style.display = 'block';
  
  // Use our new simple component
  const tableEl = document.createElement('table-view');
  
  // Access the reactive state to update it
  const state = (tableEl as any).state;
  state.tableName = tableName;
  state.loading = true;
  
  view.innerHTML = '';
  view.appendChild(tableEl);

    try {
      const data = await (window as any).ipcRenderer.db.query(`SELECT rowid, * FROM ${tableName}`);
      state.data = data;
      state.loading = false;
    } catch (e: any) {

    state.error = e.message || e;
    state.loading = false;
  }
}

export function fuzzySearch(query: string, items: any[]) {

  const q = query.toLowerCase().split('').filter(c => c !== ' ');
  return items.filter(item => {
    const label = item.label.toLowerCase();
    let i = 0;
    for (const char of q) {
      i = label.indexOf(char, i);
      if (i === -1) return false;
      i++;
    }
    return true;
  });
}

// Removed unused updateResult function


const devToolsStyles = {
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #3f3f46;
    margin-bottom: 1rem;
    h3 { margin: 0; color: #6366f1; font-family: monospace; }
  `,
  layerSection: css`
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #27272a;
    border-radius: 0.5rem;
    border-left: 4px solid #6366f1;
    h4 { margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #a1a1aa; text-transform: uppercase; }
    .layer-content { font-family: monospace; font-size: 0.8rem; color: #e4e4e7; line-height: 1.4; }
    .tag { 
      display: inline-block; 
      padding: 2px 6px; 
      border-radius: 4px; 
      font-size: 0.7rem; 
      margin-right: 5px; 
      background: #3f3f46; 
    }
    .tag-wasm { color: #facc15; }
    .tag-rust { color: #f97316; }
    .tag-native { color: #22c55e; }
  `,
  layerDetail: css`
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid rgba(63, 6도, 70, 0.2);
    &:last-child { border-bottom: none; }
    .label { color: #a1a1aa; }
    .value { color: #f4f4f5; }
  `
};

function showBaexDevTools() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const backdrop = document.createElement('div');
  backdrop.className = modalBackdrop;
  backdrop.id = 'devtools-backdrop';

  const content = document.createElement('div');
  content.className = modalContent;
  content.style.maxWidth = '50rem';

  // Get IR data from available sources
  const irData = {
    jsLayer: {
      framework: 'BAEX-SPA v1.0',
      reactivity: 'Proxy-based Deep State',
      rendering: 'Declarative Template String',
      bridge: 'IPC-Invoke / Wasm-Bridge'
    },
    wasmLayer: {
      module: 'wasm_rust.wasm',
      target: 'web',
      primitives: Object.keys(WasmBridge).reduce((acc, cat) => acc + Object.keys((WasmBridge as any)[cat]).length, 0),
      exportType: 'ESM'
    },
    rustLayer: {
      compiler: 'rustc 1.75+',
      optimizations: 'release (LTO enabled)',
      memory: 'Linear Wasm Memory',
      core_crates: ['napi', 'rusqlite', 'serde']
    },
    nativeLayer: {
      ffi: 'napi-rs / Node-API',
      db_engine: 'SQLite 3.x (Bundled)',
      storage: 'app.db (userData)',
      binary: 'index.node'
    }
  };

  const createLayerHtml = (title: string, data: any, tagClass: string) => `
    <div class="${devToolsStyles.layerSection}">
      <h4>${title}</h4>
      <div class="layer-content">
        <span class="tag ${tagClass}">L${title.split(' ')[0]}</span>
        ${Object.entries(data).map(([k, v]) => `
          <div class="${devToolsStyles.layerDetail}">
            <span class="label">${k}:</span>
            <span class="value">${v}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const createApiHtml = () => {
    const categories = Object.entries(WasmBridge);
    return categories.map(([catName, methods]) => `
      <div class="${devToolsStyles.layerSection}" style="border-left-color: #a855f7;">
        <h4>API: ${catName.toUpperCase()}</h4>
        <div class="layer-content">
          ${Object.entries(methods).map(([methodName, methodFn]) => {
            const fnStr = methodFn.toString();
            const argsMatch = fnStr.match(/\\((.*?)\\)/);
            const args = argsMatch ? argsMatch[1] : '';
            return `
              <div class="${devToolsStyles.layerDetail}">
                <span class="label" style="color: #a855f7; font-weight: bold;">${methodName}(${args})</span>
                <span class="value" style="font-size: 0.7rem; opacity: 0.6;">async Promise&lt;any&gt;</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  };

  content.innerHTML = `
    <div class="${devToolsStyles.header}">
      <h3>🛠️ BAEX Intermediate Representation Inspector</h3>
      <button id="close-devtools" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.5rem;">&times;</button>
    </div>
    <div style="overflow-y: auto; max-height: 70vh;">
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 0.9rem; color: #a1a1aa; margin-bottom: 1rem; font-family: monospace;">ARCHITECTURE LAYERS</h3>
        ${createLayerHtml('JavaScript Layer', irData.jsLayer, 'tag-wasm')}
        ${createLayerHtml('Wasm Bridge', irData.wasmLayer, 'tag-wasm')}
        ${createLayerHtml('Rust Core', irData.rustLayer, 'tag-rust')}
        ${createLayerHtml('Native FFI', irData.nativeLayer, 'tag-native')}
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 0.9rem; color: #a1a1aa; margin-bottom: 1rem; font-family: monospace;">BRIDGE API DOCUMENTATION</h3>
        ${createApiHtml()}
      </div>

      <div class="${devToolsStyles.layerSection}" style="border-left-color: #ef4444;">
        <h4>Pipeline Trace</h4>
        <div class="layer-content" style="text-align: center; font-size: 0.75rem;">
          JS $\rightarrow$ IPC $\rightarrow$ Native-Rust $\rightarrow$ SQLite $\rightarrow$ FileSystem
        </div>
      </div>
    </div>
  `;

  backdrop.appendChild(content);
  app.appendChild(backdrop);

  content.querySelector('#close-devtools')?.addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });
}

function renderTabBar() {
  const tabBar = document.querySelector('tab-bar') as HTMLElement;
  if (tabBar) {
    const tabList = Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label }));
    tabBar.setAttribute('tabs', JSON.stringify(tabList));
    (tabBar as any).setActive(activeTabId);
    tabBar.style.display = tabList.length > 0 ? 'flex' : 'none';
  }
}

async function handleAddRow(tableName: string, columns: string[]) {
  const values = columns.map(col => prompt(`Value for ${col}:`) || '');
  const colsStr = columns.join(', ');
  const valsStr = values.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
  
  try {
    await (window as any).ipcRenderer.db.query(`INSERT INTO ${tableName} (${colsStr}) VALUES (${valsStr})`);
    await renderTableContent(tableName);
  } catch (e: any) {
    alert(`Error adding row: ${e.message || e}`);
  }
}

async function handleDeleteRow(tableName: string, id: any) {
  if (!confirm(`Delete row with ID ${id}?`)) return;
  
  try {
    await (window as any).ipcRenderer.db.query(`DELETE FROM ${tableName} WHERE rowid = ${id}`);
    await renderTableContent(tableName);
  } catch (e: any) {
    alert(`Error deleting row: ${e.message || e}`);
  }
}

async function handleUpdateRow(tableName: string, id: any, columns: string[]) {
  const updates = columns.map(col => {
    const val = prompt(`New value for ${col}:`);
    return val !== null ? `${col} = '${val.replace(/'/g, "''")}'` : null;
  }).filter(Boolean);
  
  if (updates.length === 0) return;
  
  try {
    await (window as any).ipcRenderer.db.query(`UPDATE ${tableName} SET ${updates.join(', ')} WHERE rowid = ${id}`);
    await renderTableContent(tableName);
  } catch (e: any) {
    alert(`Error updating row: ${e.message || e}`);
  }
}

function handleEditRow(tableName: string, rowid: number) {
  const tableEl = document.querySelector('table-view') as any;
  if (!tableEl) return;
  
  const row = tableEl.state.data.find((r: any) => r.rowid === rowid);
  if (!row) return;
  
  tableEl.state.editingRowId = rowid;
  tableEl.state.formValues = { ...row };
}

function handleFormInput(col: string, value: string) {
  const tableEl = document.querySelector('table-view') as any;
  if (!tableEl) return;
  
  tableEl.state.formValues[col] = value;
}

async function handleFormSubmit(tableName: string, rowid: number | null) {
  if (rowid === null) return;
  
  const tableEl = document.querySelector('table-view') as any;
  if (!tableEl) return;
  
  const formValues = tableEl.state.formValues;
  const updates = Object.entries(formValues)
    .filter(([k]) => k !== 'rowid')
    .map(([k, v]) => `${k} = '${(v as string).replace(/'/g, "''")}'`);
  
  try {
    await (window as any).ipcRenderer.db.query(`UPDATE ${tableName} SET ${updates.join(', ')} WHERE rowid = ${rowid}`);
    await renderTableContent(tableName);
    tableEl.state.editingRowId = null;
  } catch (e: any) {
    alert(`Error updating row: ${e.message || e}`);
  }
}

function handleCancelEdit() {
  const tableEl = document.querySelector('table-view') as any;
  if (!tableEl) return;
  tableEl.state.editingRowId = null;
}

(window as any).handleAddRow = handleAddRow;
(window as any).handleDeleteRow = handleDeleteRow;
(window as any).handleUpdateRow = handleUpdateRow;
(window as any).handleEditRow = handleEditRow;
(window as any).handleFormInput = handleFormInput;
(window as any).handleFormSubmit = handleFormSubmit;
(window as any).handleCancelEdit = handleCancelEdit;

async function renderMapContent() {
  const view = document.getElementById('dynamic-view');
  if (!view) return;

  view.style.display = 'block';
  const mapEl = document.createElement('map-view');
  view.innerHTML = '';
  view.appendChild(mapEl);
}

async function renderChartContent() {
  const view = document.getElementById('dynamic-view');
  if (!view) return;

  view.style.display = 'block';
  const chartEl = document.createElement('chart-view');
  view.innerHTML = '';
  view.appendChild(chartEl);
}

async function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const primitiveCount = Object.values(WasmBridge).reduce((acc, cat) => acc + Object.keys(cat).length, 0);
  const regularCount = 3;

  app.innerHTML = 
    '<div class="' + navBar + '"><button class="' + homeButton + '" id="home-btn">🏠 Home</button><tab-bar id="main-tab-bar" style="flex: 1;"></tab-bar></div>' +
    '<div class="' + appContainer + '"><div class="' + contentWrapper + '">' +
        '<div id="home-view">' +
            '<div class="' + searchAndLogWrapper + '"><input type="text" id="menu-search" class="' + searchInput + '" placeholder="Search tables..." /></div>' +
            '<div style="margin-bottom: 2rem;">' +
              '<h3 style="font-size: 0.875rem; color: #a1a1aa; margin: 0 0 1rem 1rem; font-family: monospace; text-transform: uppercase;">Database Tables</h3>' +
              '<div class="' + sectionContainer + '"><div id="menu-grid" class="' + menuGrid + '"></div></div>' +
            '</div>' +
            '<div style="margin-bottom: 2rem;">' +
              '<h3 style="font-size: 0.875rem; color: #a1a1aa; margin: 0 0 1rem 1rem; font-family: monospace; text-transform: uppercase;">Analytics & Charts</h3>' +
              '<div class="' + sectionContainer + '"><div id="charts-grid" class="' + menuGrid + '"></div></div>' +
            '</div>' +
            '<div style="margin-bottom: 2rem;">' +
              '<h3 style="font-size: 0.875rem; color: #a1a1aa; margin: 0 0 1rem 1rem; font-family: monospace; text-transform: uppercase;">Map Integrations</h3>' +
              '<div class="' + sectionContainer + '"><div id="maps-grid" class="' + menuGrid + '"></div></div>' +
            '</div>' +
        '</div>' +
        '<div id="dynamic-view" style="display: none; padding: 2rem; font-family: monospace;"></div>' +
    '</div></div>' +
    '<div class="' + statusBar + '" id="status-bar">WASM Primitives: ' + primitiveCount + ' | Regular Functions: ' + regularCount + '</div>';


  document.getElementById('status-bar')?.addEventListener('click', showBaexDevTools);

  document.getElementById('home-btn')?.addEventListener('click', () => {
    activeTabId = null;
    tabs.clear();
    (document.getElementById('home-view') as HTMLElement).style.display = 'block';
    (document.getElementById('dynamic-view') as HTMLElement).style.display = 'none';
    renderTabBar();
  });

  const tabBar = document.getElementById('main-tab-bar');
  tabBar?.addEventListener('tab-selected', (e: any) => {
    activeTabId = e.detail;
    const homeView = document.getElementById('home-view') as HTMLElement;
    const dynamicView = document.getElementById('dynamic-view') as HTMLElement;
    if (homeView) homeView.style.display = 'none';
    if (dynamicView) dynamicView.style.display = 'block';
    
    const tab = tabs.get(activeTabId);
    if (tab) tab.action();
    renderTabBar();
  });

  const menuGridEl = document.getElementById('menu-grid');
  const chartsGridEl = document.getElementById('charts-grid');
  const mapsGridEl = document.getElementById('maps-grid');
  
  try {
    // Dynamic Table Loading
    const tables: string[] = await fetchTables();
    
    if (tables.length === 0) {
      menuGridEl!.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; opacity: 0.5;">No tables found in database. <br/> Run some SQL to create them!</div>';
    } else {
      tables.forEach((tableName: string) => {
        const el = document.createElement('div');
        el.className = menuItem;
        el.innerHTML = "<div>📦</div><div>" + tableName + "</div>";
        el.onclick = () => {
          const tabId = `table-${tableName}`;
          tabs.set(tabId, { 
            label: tableName, 
            action: () => renderTableContent(tableName) 
          });
          activeTabId = tabId;
          (document.getElementById('home-view') as HTMLElement).style.display = 'none';
          renderTableContent(tableName);
          renderTabBar();
        };
        menuGridEl?.appendChild(el);
      });
    }

    // Chart Integration Showcase
    const charts = [
      { id: 'perf-chart', label: 'Perf Metrics', icon: '📊' },
      { id: 'dist-chart', label: 'Data Dist', icon: '📈' },
    ];

    charts.forEach(chart => {
      const el = document.createElement('div');
      el.className = menuItem;
      el.innerHTML = `<div>${chart.icon}</div><div>${chart.label}</div>`;
      el.onclick = () => {
        const tabId = `chart-${chart.id}`;
        tabs.set(tabId, { 
          label: chart.label, 
          action: () => renderChartContent() 
        });
        activeTabId = tabId;
        (document.getElementById('home-view') as HTMLElement).style.display = 'none';
        renderChartContent();
        renderTabBar();
      };
      chartsGridEl?.appendChild(el);
    });

    // Map Integration Showcase
    const maps = [
      { id: 'world-map', label: 'World Map', icon: '🌍' },
      { id: 'city-map', label: 'City View', icon: '🏙️' },
    ];

    maps.forEach(map => {
      const el = document.createElement('div');
      el.className = menuItem;
      el.innerHTML = `<div>${map.icon}</div><div>${map.label}</div>`;
      el.onclick = () => {
        const tabId = `map-${map.id}`;
        tabs.set(tabId, { 
          label: map.label, 
          action: () => renderMapContent() 
        });
        activeTabId = tabId;
        (document.getElementById('home-view') as HTMLElement).style.display = 'none';
        renderMapContent();
        renderTabBar();
      };
      mapsGridEl?.appendChild(el);
    });

  } catch (error: any) {
    menuGridEl!.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 1rem;">
      <strong>Database Error:</strong><br/>${error.message || error}
    </div>`;
  }
}

export function startApp() {
  initApp();
  init().catch(console.error);
}

if (process.env.NODE_ENV !== 'test') {
  startApp();
}
