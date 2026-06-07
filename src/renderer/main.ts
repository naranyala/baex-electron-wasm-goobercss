import './style.css'
import { css, setup } from 'goober';
import { WasmBridge } from './framework/WasmBridge.js';
import { defineComponent } from './framework/Component.js';
import { getDatabase } from './framework/FrontendDatabase.js';
import { services } from './framework/ServiceRegistry.js';
import { router } from './framework/Router.js';
import { compiler } from './framework/Compiler.js';
import { 
  navBar, 
  brandMark, 
  homeButton, 
  appContainer, 
  contentWrapper, 
  searchBar, 
  searchInput, 
  sectionHeader, 
  sectionContainer, 
  menuGrid, 
  statusBar, 
  statusDot, 
  statusDivider,
  menuItem
} from './styles/theme.js';
import { tabs, activeTabId } from './state/appState.js';
import { dbService } from './services/DbService.js';
import { MapView } from './components/MapView.js';
import { ChartView } from './components/ChartView.js';
import { TableView } from './components/TableView.js';
import { RagMenuView } from './components/RagMenuView.js';
import 'leaflet/dist/leaflet.css';

setup(null);

// Register Components
defineComponent(MapView);
defineComponent(ChartView);
defineComponent(TableView);
defineComponent(RagMenuView);

// --- App Logic ---

async function fetchTables() {
  try {
    return await dbService.fetchTables();
  } catch (e) {
    console.error("Failed to fetch tables:", e);
    throw e;
  }
}

function renderTabBar() {
  const tabBar = document.querySelector('tab-bar') as any;
  if (!tabBar) return;
  const currentTabs = tabs.get();
  const tabList = Array.from(currentTabs.entries()).map(([id, { label }]) => ({ id, label }));
  tabBar.setAttribute('tabs', JSON.stringify(tabList));
  tabBar.setActive(activeTabId.get());
  tabBar.style.display = tabList.length > 0 ? 'flex' : 'none';
}

async function renderTableContent(tableName: string) {
  const view = document.getElementById('dynamic-view');
  if (!view) return;
  view.style.display = 'block';
  
  const tableEl = document.createElement('table-view');
  const state = (tableEl as any).state;
  state.tableName = tableName;
  state.loading = true;
  
  view.innerHTML = '';
  view.appendChild(tableEl);
  
  try {
    state.data = await dbService.getTableData(tableName);
    state.loading = false;
  } catch (e: any) {
    state.error = e.message || e;
    state.loading = false;
  }
}

async function renderChartContent() {
  const view = document.getElementById('dynamic-view');
  if (!view) return;
  view.style.display = 'block';
  const chartEl = document.createElement('chart-view');
  view.innerHTML = '';
  view.appendChild(chartEl);
}

async function renderMapContent() {
  const view = document.getElementById('dynamic-view');
  if (!view) return;
  view.style.display = 'block';
  const mapEl = document.createElement('map-view');
  view.innerHTML = '';
  view.appendChild(mapEl);
}

async function renderRagMenu() {
  const view = document.getElementById('dynamic-view');
  if (!view) return;
  view.style.display = 'block';
  const ragEl = document.createElement('rag-menu-view');
  view.innerHTML = '';
  view.appendChild(ragEl);
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

// --- DevTools ---
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
    border-bottom: 1px solid rgba(63, 63, 70, 0.2);
    &:last-child { border-bottom: none; }
    .label { color: #a1a1aa; }
    .value { color: #f4f4f5; }
  `
};

function showBaexDevTools() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop'; 
  backdrop.id = 'devtools-backdrop';
  const content = document.createElement('div');
  content.className = 'modal-content'; 
  content.style.maxWidth = '50rem';
  const irData = {
    jsLayer: { framework: 'BAEX-SPA v1.0', reactivity: 'Signal-based', rendering: 'Declarative Template', bridge: 'Worker-Bridge' },
    wasmLayer: { module: 'wasm_rust.wasm', target: 'web', primitives: Object.keys(WasmBridge).reduce((acc, cat) => acc + Object.keys((WasmBridge as any)[cat]).length, 0), exportType: 'ESM' },
    rustLayer: { compiler: 'rustc 1.95+', optimizations: 'release', memory: 'Linear Wasm Memory', core_crates: ['rusqlite', 'serde'] },
    nativeLayer: { ffi: 'napi-rs', db_engine: 'SQLite 3.x', storage: 'app.db', binary: 'index.node' }
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
    `);
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
          JS $\rightarrow$ Worker $\rightarrow$ WASM $\rightarrow$ OPFS
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

async function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // 1. Initialize and Register Services
  const db = await getDatabase();
  services.register('db', db);
  services.register('wasm', WasmBridge);
  services.register('compiler', compiler);

  // 2. Setup Routes
  router.addRoute({ path: '/', component: 'home' });
  router.addRoute({ path: '/tables', component: 'table-view' });
  router.addRoute({ path: '/charts', component: 'chart-view' });
  router.addRoute({ path: '/maps', component: 'map-view' });
  router.addRoute({ path: '/rag', component: 'rag-menu-view' });
  router.listen();

  const primitiveCount = Object.values(WasmBridge).reduce((acc, cat) => acc + Object.keys(cat).length, 0);
  const regularCount = 3;
  
  app.innerHTML = 
    '<div class="' + navBar + '">' +
      '<div class="' + brandMark + '"><span>BAEX</span></div>' +
      '<button class="' + homeButton + '" id="home-btn">⌂ Home</button>' +
      '<tab-bar id="main-tab-bar" style="flex: 1;"></tab-bar>' +
    '</div>' +
    '<div class="' + appContainer + '"><div class="' + contentWrapper + '">' +
      '<div id="home-view">' +
        '<div class="' + searchBar + '"><input type="text" id="menu-search" class="' + searchInput + '" placeholder="Search tables, charts, maps..." /></div>' +
        '<div style="margin-bottom: 2rem;">' +
          '<div class="' + sectionHeader + '">Tables</div>' +
          '<div class="' + sectionContainer + '"><div id="menu-grid" class="' + menuGrid + '"></div></div>' +
        '</div>' +
        '<div style="margin-bottom: 2rem;">' +
          '<div class="' + sectionHeader + '">Charts</div>' +
          '<div class="' + sectionContainer + '"><div id="charts-grid" class="' + menuGrid + '"></div></div>' +
        '</div>' +
        '<div style="margin-bottom: 2rem;">' +
          '<div class="' + sectionHeader + '">Maps</div>' +
          '<div class="' + sectionContainer + '"><div id="maps-grid" class="' + menuGrid + '"></div></div>' +
        '</div>' +
        '<div style="margin-bottom: 2rem;">' +
          '<div class="' + sectionHeader + '">RAG System</div>' +
          '<div class="' + sectionContainer + '"><div id="rag-grid" class="' + menuGrid + '"></div></div>' +
        '</div>' +
      '</div>' +
      '<div id="dynamic-view" style="display: none; padding: 1.5rem 0;"></div>' +
    '</div></div>' +
    '<div class="' + statusBar + '" id="status-bar">' +
      '<span style="display: flex; align-items: center; gap: 0.5rem;">' +
        '<span class="' + statusDot + '"></span>' +
        '<span id="status-project" style="color: #6b6b7b;">' + document.title + '</span>' +
      '</span>' +
      '<span style="flex: 1;"></span>' +
      '<span style="display: flex; align-items: center; gap: 0.5rem; color: #a1a1aa;">' +
        'WASM: ' + primitiveCount +
        '<span class="' + statusDivider + '"></span>' +
        'Fn: ' + regularCount +
      '</span>' +
    '</div>';

  document.getElementById('status-bar')?.addEventListener('click', showBaexDevTools);

  document.getElementById('home-btn')?.addEventListener('click', () => {
    router.navigate('/');
    activeTabId.set(null);
    tabs.get().clear();
    (document.getElementById('home-view') as HTMLElement).style.display = 'block';
    (document.getElementById('dynamic-view') as HTMLElement).style.display = 'none';
    renderTabBar();
  });

  const tabBar = document.getElementById('main-tab-bar');
  tabBar?.addEventListener('tab-selected', (e: any) => {
    const tabId = e.detail;
    activeTabId.set(tabId);
    const homeView = document.getElementById('home-view') as HTMLElement;
    const dynamicView = document.getElementById('dynamic-view') as HTMLElement;
    if (homeView) homeView.style.display = 'none';
    if (dynamicView) dynamicView.style.display = 'block';
    
    const currentTabs = tabs.get();
    const tab = currentTabs.get(tabId);
    if (tab) tab.action();
    renderTabBar();
  });

  const menuGridEl = document.getElementById('menu-grid');
  const chartsGridEl = document.getElementById('charts-grid');
  const mapsGridEl = document.getElementById('maps-grid');
  const ragGridEl = document.getElementById('rag-grid');
  
  try {
    const tables = await fetchTables();
    if (tables.length === 0) {
      menuGridEl!.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; color: #6b6b7b; font-size: 0.8125rem;">No tables found in database.</div>';
    } else {
      tables.forEach((tableName: string) => {
        const el = document.createElement('div');
        el.className = menuItem;
        el.innerHTML = '<div style="font-size: 1.25rem; line-height: 1;">🗄️</div><div style="margin-top: 0.125rem;">' + tableName + '</div>';
        el.onclick = () => {
          const tabId = `table-${tableName}`;
          tabs.get().set(tabId, { 
            label: tableName, 
            action: () => renderTableContent(tableName) 
          });
          activeTabId.set(tabId);
          (document.getElementById('home-view') as HTMLElement).style.display = 'none';
          renderTableContent(tableName);
          renderTabBar();
        };
        menuGridEl?.appendChild(el);
      });
    }

    const charts = [
      { id: 'perf-chart', label: 'Perf Metrics', icon: '📊' },
      { id: 'dist-chart', label: 'Data Dist', icon: '📈' },
    ];
    charts.forEach(chart => {
      const el = document.createElement('div');
      el.className = menuItem;
      el.innerHTML = `<div style="font-size: 1.25rem; line-height: 1;">${chart.icon}</div><div style="margin-top: 0.125rem;">${chart.label}</div>`;
      el.onclick = () => {
        const tabId = `chart-${chart.id}`;
        tabs.get().set(tabId, { 
          label: chart.label, 
          action: () => renderChartContent() 
        });
        activeTabId.set(tabId);
        (document.getElementById('home-view') as HTMLElement).style.display = 'none';
        renderChartContent();
        renderTabBar();
      };
      chartsGridEl?.appendChild(el);
    });

    const maps = [
      { id: 'world-map', label: 'World Map', icon: '🌍' },
      { id: 'city-map', label: 'City View', icon: '🏙️' },
    ];
    maps.forEach(map => {
      const el = document.createElement('div');
      el.className = menuItem;
      el.innerHTML = `<div style="font-size: 1.25rem; line-height: 1;">${map.icon}</div><div style="margin-top: 0.125rem;">${map.label}</div>`;
      el.onclick = () => {
        const tabId = `map-${map.id}`;
        tabs.get().set(tabId, { 
          label: map.label, 
          action: () => renderMapContent() 
        });
        activeTabId.set(tabId);
        (document.getElementById('home-view') as HTMLElement).style.display = 'none';
        renderMapContent();
        renderTabBar();
      };
      mapsGridEl?.appendChild(el);
    });

    const ragItems = [
      { id: 'rag-system', label: 'RAG System', icon: '🤖' }
    ];
    ragItems.forEach(item => {
      const el = document.createElement('div');
      el.className = menuItem;
      el.innerHTML = `<div style="font-size: 1.25rem; line-height: 1;">${item.icon}</div><div style="margin-top: 0.125rem;">${item.label}</div>`;
      el.onclick = () => {
        const tabId = `rag-${item.id}`;
        tabs.get().set(tabId, { 
          label: item.label, 
          action: () => renderRagMenu() 
        });
        activeTabId.set(tabId);
        (document.getElementById('home-view') as HTMLElement).style.display = 'none';
        renderRagMenu();
        renderTabBar();
      };
      ragGridEl?.appendChild(el);
    });
  } catch (error: any) {
    menuGridEl!.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #f87171; font-size: 0.8125rem;">
      ${error.message || error}
    </div>`;
  }
}

if (process.env.NODE_ENV !== 'test') {
  initApp();
}
