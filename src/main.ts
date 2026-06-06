import './style.css'
import './components/tab-bar.js'
import { css, setup } from 'goober';
import init, { add, fibonacci, extended_greet } from '../wasm-rust/pkg/wasm_rust.js';

setup(null);

const menuItem = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 1.5rem;
  background-color: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    transform: translateY(-0.25rem);
    background-color: #3f3f46;
    border-color: #6366f1;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const menuIcon = css`
  font-size: 2.25rem;
  margin-bottom: 0.75rem;
  transition: transform 0.2s;
  .group:hover & {
    transform: scale(1.1);
  }
`;

const menuLabel = css`
  font-size: 0.875rem;
  font-weight: 500;
  color: #d4d4d8;
  .group:hover & {
    color: #ffffff;
  }
`;

const exampleWrapper = css`
  margin-bottom: 1.5rem;
  background-color: #27272a;
  border-radius: 0.75rem;
  border: 1px solid #3f3f46;
  overflow: hidden;
`;

const exampleHeader = css`
  padding: 0.5rem 1rem;
  background-color: #3f3f46;
  font-size: 0.75rem;
  font-family: monospace;
  color: #a1a1aa;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const exampleCode = css`
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  font-family: monospace;
  color: #a5b4fc;
  background-color: #18181b;
`;

const appContainer = css`
  min-height: 100vh;
  background-color: #18181b;
  color: #f4f4f5;
  padding: 0;
  padding-top: 4rem;
`;

const contentWrapper = css`
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem;
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
  &::placeholder {
    color: #71717a;
  }
`;

const log = css`
  font-size: 0.875rem;
  font-family: monospace;
  color: #818cf8;
  transition: opacity 0.2s;
  min-height: 1.5rem;
`;

const sectionContainer = css`
  border: 1px solid #3f3f46;
  border-radius: 1rem;
  overflow: hidden;
  background-color: rgba(39, 39, 42, 0.5);
`;

const sectionHeader = css`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #27272a;
  }
`;

const sectionTitle = css`
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const sectionArrow = css`
  transition: transform 0.2s;
  color: #71717a;
`;

const wasmSectionContent = css`
  padding: 1.5rem;
  border-top: 1px solid #3f3f46;
`;

const menuGrid = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

// Application State
const tabs = new Map(); // id -> { label, action }
let activeTabId: string | null = null;

function renderTabBar() {
  const tabBar = document.querySelector('tab-bar');
  if (tabBar) {
    tabBar.setAttribute('tabs', JSON.stringify(Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label }))));
    if (activeTabId) (tabBar as any).setActive(activeTabId);
  }
}

export const MENU_ITEMS = [
  { 
    id: 'zig-backend', 
    label: 'Native Engine', 
    icon: '⚙️', 
    action: async () => {
      const version = await (window as any).ipcRenderer.invoke('zig-engine:version');
      const sum = await (window as any).ipcRenderer.invoke('zig-engine:add', [10, 20]);
      updateResult(`[Native Zig] Version: ${version}\nCalculation: 10 + 20 = ${sum}`);
    } 
  },
  { 
    id: 'wasm-math', 
    label: 'Wasm Math', 
    icon: '⚡', 
    action: () => {
      const res = add(10, 32);
      const fib = fibonacci(7);
      updateResult(`[Wasm] 10 + 32 = ${res}\nFibonacci(7) = ${fib}`);
    } 
  },
  { 
    id: 'wasm-extended', 
    label: 'Extended API', 
    icon: '🌐', 
    action: () => {
      extended_greet('Developer');
      updateResult(`[Wasm Extended] Check the browser tab title and console!`);
    } 
  },
  { id: 'settings', label: 'Settings', icon: '🛠️', action: () => updateResult('Settings Panel') },
  { id: 'profile', label: 'Profile', icon: '👤', action: () => updateResult('Profile Panel') },
  { id: 'analytics', label: 'Analytics', icon: '📊', action: () => updateResult('Analytics Panel') },
  { id: 'messages', label: 'Messages', icon: '✉️', action: () => updateResult('Messages Panel') },
  { id: 'cloud', label: 'Cloud Storage', icon: '☁️', action: () => updateResult('Cloud Panel') },
  { id: 'security', label: 'Security', icon: '🛡️', action: () => updateResult('Security Panel') },
  { id: 'help', label: 'Help Center', icon: '❓', action: () => updateResult('Help Panel') },
  { id: 'terminal', label: 'Terminal', icon: '💻', action: () => updateResult('Terminal Panel') },
  { id: 'network', label: 'Network', icon: '🌐', action: () => updateResult('Network Panel') },
  { id: 'files', label: 'File Manager', icon: '📂', action: () => updateResult('Files Panel') },
  { id: 'database', label: 'Database', icon: '🗄️', action: () => updateResult('Database Panel') },
];

const CODE_EXAMPLES = [
  { 
    title: 'Rust Wasm Export', 
    language: 'rust', 
    code: `#[wasm_bindgen]\npub fn add(a: i32, b: i32) -> i32 {\n    a + b\n}` 
  },
  { 
    title: 'Wasm Init', 
    language: 'typescript', 
    code: `import init from '../wasm-rust/pkg/wasm_rust.js';\nawait init();` 
  },
  { 
    title: 'CSS-in-JS (goober)', 
    language: 'typescript', 
    code: `const menuItem = css\`display: flex; background: #27272a;\`;` 
  },
];

function updateResult(text: string) {
  if (activeTabId) {
    const tab = tabs.get(activeTabId);
    if (tab) {
      (tab as any).result = text;
    }
  }
  const el = document.querySelector<HTMLDivElement>('#execution-log');
  if (el) {
    el.innerText = text;
    el.classList.remove('opacity-50');
    el.classList.add('opacity-100');
  }
}

export function fuzzySearch(query: string, items: typeof MENU_ITEMS) {
  const q = query.toLowerCase();
  return items.filter(item => {
    const label = item.label.toLowerCase();
    if (label.includes(q)) return true;
    let i = 0, j = 0;
    while (i < q.length && j < label.length) {
      if (q[i] === label[j]) i++;
      j++;
    }
    return i === q.length;
  });
}

function renderMenu(items: typeof MENU_ITEMS) {
  const grid = document.querySelector<HTMLDivElement>('#menu-grid');
  if (!grid) return;
  grid.innerHTML = items.map(item => `
    <div class="group ${menuItem}" onclick="window.dispatchMenuAction('${item.id}')">
      <div class="${menuIcon}">${item.icon}</div>
      <div class="${menuLabel}">${item.label}</div>
    </div>
  `).join('');
}

function renderExamples() {
  const container = document.querySelector<HTMLDivElement>('#examples-container');
  if (!container) return;
  container.innerHTML = CODE_EXAMPLES.map(ex => `
    <div class="${exampleWrapper}">
      <div class="${exampleHeader}">
        <span>${ex.title}</span>
        <span style="text-transform: uppercase;">${ex.language}</span>
      </div>
      <pre class="${exampleCode}"><code>${ex.code}</code></pre>
    </div>
  `).join('');
}

function toggleSection(id: string) {
  const content = document.getElementById(id);
  const arrow = document.getElementById(`arrow-${id}`);
  if (content && arrow) {
    content.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');
  }
}

function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = `
    <!-- Native Web Component Tab Bar -->
    <tab-bar id="main-tab-bar"></tab-bar>

    <div class="${appContainer}">
      <div class="${contentWrapper}" id="main-content">
        <!-- Main Content Area -->
        <div id="view-container">
          <div class="${searchAndLogWrapper}">
            <input 
              type="text" 
              id="menu-search" 
              class="${searchInput}" 
              placeholder="Search tools..." 
              autofocus 
            />
            <div id="execution-log" class="${log}">
              Click a module to see output here
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="${sectionContainer}">
              <div class="${sectionHeader}" onclick="window.toggleSection('wasm-section')">
                <h2 class="${sectionTitle}"><span style="color: #818cf8;">⚡</span> Wasm & Native Modules</h2>
                <span id="arrow-wasm-section" class="${sectionArrow}">▼</span>
              </div>
              <div id="wasm-section" class="${wasmSectionContent}">
                <div id="menu-grid" class="${menuGrid}"></div>
              </div>
            </div>

            <div class="${sectionContainer}">
              <div class="${sectionHeader}" onclick="window.toggleSection('examples-section')">
                <h2 class="${sectionTitle}"><span style="color: #34d399;">📄</span> Code Examples</h2>
                <span id="arrow-examples-section" class="${sectionArrow}">▼</span>
              </div>
              <div id="examples-section" class="${wasmSectionContent}" style="display: none;">
                <div id="examples-container" style="display: flex; flex-direction: column; gap: 1rem;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const tabBar = document.getElementById('main-tab-bar');
  if (tabBar) {
    tabBar.addEventListener('tab-selected', (e: any) => {
      const tabId = e.detail;
      activeTabId = tabId;
      const tab = tabs.get(tabId);
      if (tab && (tab as any).result) {
        updateResult((tab as any).result);
      } else if (tab) {
        tab.action();
      }
      renderTabBar();
    });
  }

  (window as any).dispatchMenuAction = (id: string) => {
      const item = MENU_ITEMS.find(i => i.id === id);
      if (item) {
          const existingTab = tabs.get(item.id);
          if (existingTab) {
              activeTabId = item.id;
              if ((existingTab as any).result) {
                  updateResult((existingTab as any).result);
              } else {
                  item.action();
              }
          } else {
              tabs.set(item.id, { label: item.label, action: item.action });
              activeTabId = item.id;
              item.action();
          }
          renderTabBar();
      }
  };

  (window as any).toggleSection = toggleSection;

  const searchInputEl = document.querySelector<HTMLInputElement>('#menu-search');
  if (searchInputEl) {
    searchInputEl.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      const filtered = fuzzySearch(query, MENU_ITEMS);
      renderMenu(filtered);
    });
  }

  renderMenu(MENU_ITEMS);
  renderExamples();
}

async function loadWasm() {
  try {
    await init();
    console.log('Wasm Engine initialized');
  } catch (e) {
    console.error('Wasm load error:', e);
  }
}

export function startApp() {
  initApp();
  loadWasm();

  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
}

if (process.env.NODE_ENV !== 'test') {
  startApp();
}
