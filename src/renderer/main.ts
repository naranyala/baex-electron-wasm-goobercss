import './style.css'
import { css, setup } from 'goober';
import { WasmBridge } from './core/bridge/WasmBridge.js';
import { defineComponent } from './core/ui/Component.js';
import { getDatabase } from './core/db/FrontendDatabase.js';
import { services } from './core/routing/ServiceRegistry.js';
import { router } from './core/routing/Router.js';
import { compiler } from './core/bridge/Compiler.js';
import { rustState } from './core/reactivity/RustState.js';
import { 
  styles as themeStyles
} from './styles/theme.ts';
import { openTabs, activeTabId } from './state/appState.js';
import { dbService } from './services/DbService.js';
import { MapView } from './components/views/MapView.js';
import { ChartView } from './components/views/ChartView.js';
import { TableView } from './components/views/TableView.js';
import { RagMenuView } from './components/views/RagMenuView.ts';
import { AccordionView } from './components/views/AccordionView.ts';
import { TreeViewView } from './components/views/TreeViewView.ts';
import { DataTableView } from './components/views/DataTableView.ts';
import { Cube3DView } from './components/views/Cube3DView.ts';
import { FormWizardView } from './components/views/FormWizardView.ts';
import { DrawerView } from './components/views/DrawerView.ts';
import { GeolocationView } from './components/views/GeolocationView.ts';
import { NotificationView } from './components/views/NotificationView.ts';
import { StorageView } from './components/views/StorageView.ts';
import { TabManager } from './core/routing/TabManager.ts';
import { StatusBar } from './components/StatusBar.ts';
import { fuzzySearch } from './lib/utils';
import './components/tab-bar.ts';
import 'leaflet/dist/leaflet.css';

setup(null);

// Register Components
defineComponent(MapView);
defineComponent(ChartView);
defineComponent(TableView);
defineComponent(RagMenuView);
defineComponent(AccordionView);
defineComponent(TreeViewView);
defineComponent(DataTableView);
defineComponent(Cube3DView);
defineComponent(FormWizardView);
defineComponent(DrawerView);
defineComponent(GeolocationView);
defineComponent(NotificationView);
defineComponent(StorageView);
defineComponent(StatusBar);

// --- App Logic ---

async function fetchTables() {
  try {
    return await dbService.fetchTables();
  } catch (e) {
    console.error("Failed to fetch tables:", e);
    throw e;
  }
}

// --- Tab System ---

const panels = new Map<string, HTMLElement>();
const scrollPositions = new Map<string, number>();
let lastViewId: string | null = null;

function showView(id: string | null) {
  const home = document.getElementById('home-view');
  const dyn = document.getElementById('dynamic-view');
  if (!home || !dyn) return;

  // Save scroll position of the view we are leaving
  if (lastViewId !== null) {
    scrollPositions.set(lastViewId, window.scrollY);
  }

  if (!id) {
    home.style.display = '';
    dyn.style.display = 'none';
    panels.forEach(el => { el.style.display = 'none'; });
    window.scrollTo(0, scrollPositions.get('home') || 0);
  } else {
    home.style.display = 'none';
    dyn.style.display = '';
    panels.forEach((el, key) => {
      el.style.display = key === id ? '' : 'none';
    });
    window.scrollTo(0, scrollPositions.get(id) || 0);
  }
  
  lastViewId = id;
}

function syncTabBar() {
  const bar = document.querySelector('tab-bar') as any;
  if (!bar) return;
  bar.setAttribute('tabs', JSON.stringify(openTabs.get()));
  bar.setAttribute('active', activeTabId.get() ?? '');
  bar.style.display = openTabs.get().length ? '' : 'none';
}

function persist() {
  TabManager.save(openTabs.get(), activeTabId.get());
}

function openTab(id: string, label: string, factory: () => HTMLElement) {
  const list = openTabs.get();
  if (!list.find(t => t.id === id)) {
    list.push({ id, label });
    openTabs.set([...list]);

    const el = factory();
    el.style.display = 'none';
    panels.set(id, el);
    document.getElementById('dynamic-view')?.appendChild(el);
  }
  activeTabId.set(id);
  showView(id);
  syncTabBar();
  persist();
}

function closeTab(id: string) {
  const list = openTabs.get().filter(t => t.id !== id);
  openTabs.set(list);

  const el = panels.get(id);
  if (el) { el.remove(); panels.delete(id); }

  const cur = activeTabId.get();
  if (cur === id) {
    const next = list.length ? list[list.length - 1].id : null;
    activeTabId.set(next);
    showView(next);
  }
  syncTabBar();
  persist();
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

function showExbaDevTools() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop'; 
  backdrop.id = 'devtools-backdrop';
  const content = document.createElement('div');
  content.className = 'modal-content'; 
  content.style.maxWidth = '50rem';
  const irData = {
    jsLayer: { framework: 'EXBA-SPA v1.0', reactivity: 'Signal-based', rendering: 'Declarative Template', bridge: 'Worker-Bridge' },
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
      <h3>🛠️ EXBA Intermediate Representation Inspector</h3>
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
      '<div class="' + themeStyles.navBar + '">' +
        '<div class="' + themeStyles.brandHome + '" id="home-btn"><span>EXBA</span></div>' +
        '<tab-bar id="main-tab-bar" style="flex: 1;"></tab-bar>' +
      '</div>' +
      '<div class="' + themeStyles.appContainer + '"><div class="' + themeStyles.contentWrapper + '">' +
        '<div id="home-view">' +
          '<div class="' + themeStyles.searchBar + '"><input type="text" id="menu-search" class="' + themeStyles.searchInput + '" placeholder="Search tables, charts, maps..." /></div>' +
          '<div class="' + themeStyles.section + '">' +
            '<div class="' + themeStyles.sectionHeader + '">Tables</div>' +
            '<div class="' + themeStyles.sectionContainer + '"><div id="menu-grid" class="' + themeStyles.menuGrid + '"></div></div>' +
          '</div>' +
          '<div class="' + themeStyles.section + '">' +
            '<div class="' + themeStyles.sectionHeader + '">Charts</div>' +
            '<div class="' + themeStyles.sectionContainer + '"><div id="charts-grid" class="' + themeStyles.menuGrid + '"></div></div>' +
          '</div>' +
          '<div class="' + themeStyles.section + '">' +
            '<div class="' + themeStyles.sectionHeader + '">Maps</div>' +
            '<div class="' + themeStyles.sectionContainer + '"><div id="maps-grid" class="' + themeStyles.menuGrid + '"></div></div>' +
          '</div>' +
          '<div class="' + themeStyles.section + '">' +
            '<div class="' + themeStyles.sectionHeader + '">RAG System</div>' +
            '<div class="' + themeStyles.sectionContainer + '"><div id="rag-grid" class="' + themeStyles.menuGrid + '"></div></div>' +
          '</div>' +
          '<div class="' + themeStyles.section + '">' +
            '<div class="' + themeStyles.sectionHeader + '">Component Examples</div>' +
            '<div class="' + themeStyles.sectionContainer + '"><div id="examples-grid" class="' + themeStyles.menuGrid + '"></div></div>' +
          '</div>' +
          '<div class="' + themeStyles.section + '">' +
            '<div class="' + themeStyles.sectionHeader + '">Browser API Exploration</div>' +
            '<div class="' + themeStyles.sectionContainer + '"><div id="browser-api-grid" class="' + themeStyles.menuGrid + '"></div></div>' +
          '</div>' +
        '</div>' +
        '<div id="dynamic-view" style="display: none; padding: 1.5rem 0;"></div>' +
      '</div></div>' +
      '<status-bar id="status-bar"></status-bar>';


  document.getElementById('status-bar')?.addEventListener('click', showExbaDevTools);

  document.getElementById('home-btn')?.addEventListener('click', () => {
    activeTabId.set(null);
    showView(null);
    syncTabBar();
    persist();
  });

  const tabBar = document.getElementById('main-tab-bar');
  tabBar?.addEventListener('tab-click', (e: any) => {
    const id = e.detail;
    activeTabId.set(id);
    showView(id);
    syncTabBar();
    persist();
  });
  tabBar?.addEventListener('tab-close', (e: any) => {
    closeTab(e.detail);
  });

  // Restore persisted state
  const { tabs: stored, activeId } = TabManager.load();
  if (stored.length) {
    openTabs.set(stored);
    stored.forEach(({ id }) => {
      let el: HTMLElement | null = null;
      if (id.startsWith('table-')) {
        const tableName = id.slice(6);
        el = document.createElement('table-view');
        (el as any).setState(() => ({ tableName, loading: true }));
        dbService.getTableData(tableName).then(data => {
          (el as any).setState(() => ({ data, loading: false }));
        }).catch((e: any) => {
          (el as any).setState(() => ({ error: e.message || e, loading: false }));
        });
      } else if (id.startsWith('chart-')) {
        el = document.createElement('chart-view');
      } else if (id.startsWith('map-')) {
        el = document.createElement('map-view');
      } else if (id.startsWith('rag-')) {
        el = document.createElement('rag-menu-view');
      } else if (id.startsWith('example-')) {
        const map: Record<string, string> = {
          'example-accordion': 'accordion-view',
          'example-tree': 'tree-view',
          'example-table': 'data-table-view',
          'example-cube': 'cube-3d-view',
          'example-wizard': 'form-wizard-view',
          'example-drawer': 'drawer-view',
        };
        if (map[id]) el = document.createElement(map[id]);
      } else if (id.startsWith('browser-')) {
        const map: Record<string, string> = {
          'browser-geolocation': 'geolocation-view',
          'browser-notification': 'notification-view',
          'browser-storage': 'storage-view',
        };
        if (map[id]) el = document.createElement(map[id]);
      }
      if (el) {
        el.style.display = 'none';
        panels.set(id, el);
        document.getElementById('dynamic-view')?.appendChild(el);
      }
    });
    if (activeId && panels.has(activeId)) {
      activeTabId.set(activeId);
      showView(activeId);
    } else {
      showView(null);
    }
  } else {
    showView(null);
  }
  syncTabBar();

  const menuGridEl = document.getElementById('menu-grid');
  const chartsGridEl = document.getElementById('charts-grid');
  const mapsGridEl = document.getElementById('maps-grid');
  const ragGridEl = document.getElementById('rag-grid');
  const examplesGridEl = document.getElementById('examples-grid');
  const browserApiGridEl = document.getElementById('browser-api-grid');
  
  try {
    const tables = await fetchTables();
    if (tables.length === 0) {
      menuGridEl!.innerHTML = '<div class="' + themeStyles.emptyState + '">No tables found in database.</div>';
    } else {
        tables.forEach((tableName: string) => {
          const el = document.createElement('div');
          el.className = themeStyles.menuItem;
          el.innerHTML = '<div class="' + themeStyles.menuIcon + '">🗄️</div><div class="' + themeStyles.menuLabel + '">' + tableName + '</div>';
          el.onclick = () => {
            openTab(`table-${tableName}`, tableName, () => {
              const view = document.createElement('table-view');
              (view as any).setState(() => ({ tableName, loading: true }));
              dbService.getTableData(tableName).then(data => {
                (view as any).setState(() => ({ data, loading: false }));
              }).catch((e: any) => {
                (view as any).setState(() => ({ error: e.message || e, loading: false }));
              });
              return view;
            });
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
      el.className = themeStyles.menuItem;
      el.innerHTML = `<div class="${themeStyles.menuIcon}">${chart.icon}</div><div class="${themeStyles.menuLabel}">${chart.label}</div>`;
      el.onclick = () => {
        openTab(`chart-${chart.id}`, chart.label, () => document.createElement('chart-view'));
      };
      chartsGridEl?.appendChild(el);
    });

    const maps = [
      { id: 'world-map', label: 'World Map', icon: '🌍' },
      { id: 'city-map', label: 'City View', icon: '🏙️' },
    ];
    maps.forEach(map => {
      const el = document.createElement('div');
      el.className = themeStyles.menuItem;
      el.innerHTML = `<div class="${themeStyles.menuIcon}">${map.icon}</div><div class="${themeStyles.menuLabel}">${map.label}</div>`;
      el.onclick = () => {
        openTab(`map-${map.id}`, map.label, () => document.createElement('map-view'));
      };
      mapsGridEl?.appendChild(el);
    });

    const ragItems = [
      { id: 'rag-system', label: 'RAG System', icon: '🤖' }
    ];
    ragItems.forEach(item => {
      const el = document.createElement('div');
      el.className = themeStyles.menuItem;
      el.innerHTML = `<div class="${themeStyles.menuIcon}">${item.icon}</div><div class="${themeStyles.menuLabel}">${item.label}</div>`;
      el.onclick = () => {
        openTab(`rag-${item.id}`, item.label, () => document.createElement('rag-menu-view'));
      };
      ragGridEl?.appendChild(el);
    });

    const exampleItems = [
      { id: 'accordion', label: 'Accordion Demo', icon: '🗂️' },
      { id: 'tree', label: 'Treeview Demo', icon: '🌲' },
      { id: 'table', label: 'Sorted Table', icon: '📊' },
      { id: 'cube', label: '3D Cube (LA)', icon: '🧊' },
      { id: 'wizard', label: 'Form Wizard', icon: '📝' },
      { id: 'drawer', label: 'Sliding Drawer', icon: '📱' },
    ];
    exampleItems.forEach(item => {
      const el = document.createElement('div');
      el.className = themeStyles.menuItem;
      el.innerHTML = `<div class="${themeStyles.menuIcon}">${item.icon}</div><div class="${themeStyles.menuLabel}">${item.label}</div>`;
      el.onclick = () => {
        openTab(`example-${item.id}`, item.label, () => {
          const view = document.createElement(item.id === 'accordion' ? 'accordion-view' : item.id === 'tree' ? 'tree-view' : item.id === 'table' ? 'data-table-view' : item.id === 'cube' ? 'cube-3d-view' : item.id === 'wizard' ? 'form-wizard-view' : 'drawer-view');
          return view;
        });
      };
      examplesGridEl?.appendChild(el);
    });

    const browserApiItems = [
      { id: 'geolocation', label: 'Geolocation API', icon: '📍' },
      { id: 'notification', label: 'Notification API', icon: '🔔' },
      { id: 'storage', label: 'Web Storage API', icon: '💾' },
    ];
    browserApiItems.forEach(item => {
      const el = document.createElement('div');
      el.className = themeStyles.menuItem;
      el.innerHTML = `<div class="${themeStyles.menuIcon}">${item.icon}</div><div class="${themeStyles.menuLabel}">${item.label}</div>`;
      el.onclick = () => {
        openTab(`browser-${item.id}`, item.label, () => {
          const view = document.createElement(item.id === 'geolocation' ? 'geolocation-view' : item.id === 'notification' ? 'notification-view' : 'storage-view');
          return view;
        });
      };
      browserApiGridEl?.appendChild(el);
    });
  } catch (error: any) {
    menuGridEl!.innerHTML = '<div class="' + themeStyles.errorState + '">' + (error.message || error) + '</div>';
  }

  // Test Rust State Dispatch
  rustState.dispatch('SetProjectName', { name: 'EXBA Rust-Core Project' });
}

if (process.env.NODE_ENV !== 'test') {
  initApp();
}
