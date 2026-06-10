import './style.css'
import { setup } from 'goober';
import { WasmBridge } from './core/bridge/WasmBridge';
import { defineComponent } from './core/ui/Component';
import { getDatabase } from './core/db/FrontendDatabase';
import { services } from './core/routing/ServiceRegistry';
import { router } from './core/routing/Router';
import { compiler } from './core/bridge/Compiler';
import { rustState } from './core/reactivity/RustState';
import { 
  styles as themeStyles
} from './styles/theme';
import { openTabs, activeTabId } from './state/appState';
import { dbService } from './services/DbService';
import { MapView } from './components/views/MapView';
import { ChartView } from './components/views/ChartView';
import { TableView } from './components/views/TableView';
import { RagMenuView } from './components/views/RagMenuView';
import { AccordionView } from './components/views/AccordionView';
import { TreeViewView } from './components/views/TreeViewView';
import { DataTableView } from './components/views/DataTableView';
import { Cube3DView } from './components/views/Cube3DView';
import { FormWizardView } from './components/views/FormWizardView';
import { DrawerView } from './components/views/DrawerView';
import { GeolocationView } from './components/views/GeolocationView';
import { NotificationView } from './components/views/NotificationView';
import { StorageView } from './components/views/StorageView';
import { SystemFetchView } from './components/views/SystemFetchView';
import { KanbanView } from './components/views/KanbanView';
import { TabManager } from './core/routing/TabManager';
import { StatusBar } from './components/StatusBar';

import './components/tab-bar';
import 'leaflet/dist/leaflet.css';

// Initialize goober
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
defineComponent(SystemFetchView);
defineComponent(KanbanView);
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
  persist();
}

async function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  console.log('Starting application initialization...');

  // 0. Initialize Rust State (WASM)
  try {
    await rustState.initialize();
  } catch (e) {
    console.error('Failed to initialize Rust state:', e);
  }

  // 1. Initialize and Register Services
  try {
    const db = await getDatabase();
    services.register('db', db);
    services.register('wasm', WasmBridge);
    services.register('compiler', compiler);
  } catch (e) {
    console.error('Failed to initialize services:', e);
  }

  // 2. Setup Routes
  router.addRoute({ path: '/', component: 'home' });
  router.addRoute({ path: '/tables', component: 'table-view' });
  router.addRoute({ path: '/charts', component: 'chart-view' });
  router.addRoute({ path: '/maps', component: 'map-view' });
  router.addRoute({ path: '/rag', component: 'rag-menu-view' });
  router.addRoute({ path: '/fetch', component: 'system-fetch-view' });
  router.addRoute({ path: '/kanban', component: 'kanban-view' });

  // 3. Render Root Structure
  app.innerHTML = `
    <div class="${themeStyles.navBar}">
      <div class="${themeStyles.brandHome}" id="home-btn"><span>EXBA</span></div>
      <tab-bar id="main-tab-bar" style="flex: 1;"></tab-bar>
    </div>
    <div class="${themeStyles.appContainer}">
      <div class="${themeStyles.contentWrapper}">
        <div id="home-view">
          <div class="${themeStyles.searchBar}">
            <input type="text" id="menu-search" class="${themeStyles.searchInput}" placeholder="Search tables, charts, maps..." />
          </div>
          <div class="${themeStyles.section}">
            <div class="${themeStyles.sectionHeader}">Tables</div>
            <div class="${themeStyles.sectionContainer}">
              <div id="menu-grid" class="${themeStyles.menuGrid}"></div>
            </div>
          </div>
          <div class="${themeStyles.section}">
            <div class="${themeStyles.sectionHeader}">Charts</div>
            <div class="${themeStyles.sectionContainer}">
              <div id="charts-grid" class="${themeStyles.menuGrid}"></div>
            </div>
          </div>
          <div class="${themeStyles.section}">
            <div class="${themeStyles.sectionHeader}">Maps</div>
            <div class="${themeStyles.sectionContainer}">
              <div id="maps-grid" class="${themeStyles.menuGrid}"></div>
            </div>
          </div>
          <div class="${themeStyles.section}">
            <div class="${themeStyles.sectionHeader}">RAG System</div>
            <div class="${themeStyles.sectionContainer}">
              <div id="rag-grid" class="${themeStyles.menuGrid}"></div>
            </div>
          </div>
          <div class="${themeStyles.section}">
            <div class="${themeStyles.sectionHeader}">Component Examples</div>
            <div class="${themeStyles.sectionContainer}">
              <div id="examples-grid" class="${themeStyles.menuGrid}"></div>
            </div>
          </div>
          <div class="${themeStyles.section}">
            <div class="${themeStyles.sectionHeader}">Browser API Exploration</div>
            <div class="${themeStyles.sectionContainer}">
              <div id="browser-api-grid" class="${themeStyles.menuGrid}"></div>
            </div>
          </div>
        </div>
        <div id="dynamic-view" style="display: none; padding: 1.5rem 0;"></div>
      </div>
    </div>
    <status-bar id="status-bar"></status-bar>
  `;

  // 4. Start Router
  router.listen();

  // Attach basic listeners
  document.getElementById('home-btn')?.addEventListener('click', () => {
    activeTabId.set(null);
    showView(null);
    persist();
  });

  window.addEventListener('tab-click', (e: any) => {
    const id = e.detail;
    activeTabId.set(id);
    showView(id);
    persist();
  });
  window.addEventListener('tab-close', (e: any) => {
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
          'example-kanban': 'kanban-view',
        };
        if (map[id]) el = document.createElement(map[id]);
      } else if (id.startsWith('browser-')) {
        const map: Record<string, string> = {
          'browser-geolocation': 'geolocation-view',
          'browser-notification': 'notification-view',
          'browser-storage': 'storage-view',
          'browser-fetch': 'system-fetch-view',
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

  // 5. Populate Grids (Non-blocking)
  const menuGridEl = document.getElementById('menu-grid');
  const chartsGridEl = document.getElementById('charts-grid');
  const mapsGridEl = document.getElementById('maps-grid');
  const ragGridEl = document.getElementById('rag-grid');
  const examplesGridEl = document.getElementById('examples-grid');
  const browserApiGridEl = document.getElementById('browser-api-grid');

  (async () => {
    try {
      const tables = await fetchTables();
      if (tables.length === 0) {
        if (menuGridEl) menuGridEl.innerHTML = `<div class="${themeStyles.emptyState}">No tables found in database.</div>`;
      } else {
          tables.forEach((tableName: string) => {
            const el = document.createElement('div');
            el.className = themeStyles.menuItem;
            el.innerHTML = `<div class="${themeStyles.menuIcon}">🗄️</div><div class="${themeStyles.menuLabel}">${tableName}</div>`;
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
    } catch (e) {
      if (menuGridEl) menuGridEl.innerHTML = `<div class="${themeStyles.errorState}">Failed to load tables.</div>`;
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
      { id: 'kanban', label: 'Kanban Board', icon: '📋' },
    ];
    exampleItems.forEach(item => {
      const el = document.createElement('div');
      el.className = themeStyles.menuItem;
      el.innerHTML = `<div class="${themeStyles.menuIcon}">${item.icon}</div><div class="${themeStyles.menuLabel}">${item.label}</div>`;
      el.onclick = () => {
        openTab(`example-${item.id}`, item.label, () => {
          let viewName = 'div';
          if (item.id === 'accordion') viewName = 'accordion-view';
          else if (item.id === 'tree') viewName = 'tree-view';
          else if (item.id === 'table') viewName = 'data-table-view';
          else if (item.id === 'cube') viewName = 'cube-3d-view';
          else if (item.id === 'wizard') viewName = 'form-wizard-view';
          else if (item.id === 'drawer') viewName = 'drawer-view';
          else if (item.id === 'kanban') viewName = 'kanban-view';
          return document.createElement(viewName);
        });
      };
      examplesGridEl?.appendChild(el);
    });

    const browserApiItems = [
      { id: 'geolocation', label: 'Geolocation API', icon: '📍' },
      { id: 'notification', label: 'Notification API', icon: '🔔' },
      { id: 'storage', label: 'Web Storage API', icon: '💾' },
      { id: 'fetch', label: 'System Web-Fetch (WASM)', icon: '🚀' },
    ];
    browserApiItems.forEach(item => {
      const el = document.createElement('div');
      el.className = themeStyles.menuItem;
      el.innerHTML = `<div class="${themeStyles.menuIcon}">${item.icon}</div><div class="${themeStyles.menuLabel}">${item.label}</div>`;
      el.onclick = () => {
        openTab(`browser-${item.id}`, item.label, () => {
          let view: HTMLElement;
          if (item.id === 'geolocation') view = document.createElement('geolocation-view');
          else if (item.id === 'notification') view = document.createElement('notification-view');
          else if (item.id === 'fetch') view = document.createElement('system-fetch-view');
          else view = document.createElement('storage-view');
          return view;
        });
      };
      browserApiGridEl?.appendChild(el);
    });
  })();

  // Test Rust State Dispatch
  rustState.dispatch('SetProjectName', { name: 'EXBA Rust-Core Project' });
  
  console.log('Application initialized successfully');
}

if (process.env.NODE_ENV !== 'test') {
  initApp();
}
