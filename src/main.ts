import './style.css'
import './components/tab-bar.js'
import { css, setup } from 'goober';
import { WasmBridge } from './framework/WasmBridge.js';
import init from '../wasm-rust/pkg/wasm_rust.js';

setup(null);

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
  padding-top: 5rem;
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
  gap: 1.5rem;
  padding: 1.5rem;
`;

const menuItem = css`
  aspect-ratio: 1;
  padding: 1rem;
  background-color: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Application State
const tabs = new Map();
let activeTabId: string | null = null;

export const MENU_ITEMS = [
  { id: 'wasm-math', label: 'Wasm Math', icon: '⚡', action: async () => {
      const res = await WasmBridge.compute.add(10, 32);
      const fib = await WasmBridge.compute.fibonacci(7);
      updateResult("[Wasm IR] 10 + 32 = " + res + "\nFibonacci(7) = " + fib);
  }},
  { id: 'wasm-extended', label: 'Extended API', icon: '🌐', action: async () => {
      await WasmBridge.system.greet('Developer');
      updateResult("[Wasm IR Extended] Check title!");
  }},
  { id: 'zig-backend', label: 'Native Engine', icon: '⚙️', action: async () => {}},
];

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

function updateResult(text: string) {
  const el = document.getElementById('dynamic-view');
  if (el) el.innerText = text;
}

function renderTabBar() {
  const tabBar = document.querySelector('tab-bar');
  if (tabBar) {
    tabBar.setAttribute('tabs', JSON.stringify(Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label }))));
    (tabBar as any).setActive(activeTabId);
  }
}

function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = 
    '<div class="' + navBar + '"><button class="' + homeButton + '" id="home-btn">🏠 Home</button><tab-bar id="main-tab-bar" style="flex: 1;"></tab-bar></div>' +
    '<div class="' + appContainer + '"><div class="' + contentWrapper + '">' +
        '<div id="home-view">' +
           '<div class="' + searchAndLogWrapper + '"><input type="text" id="menu-search" class="' + searchInput + '" placeholder="Search..." /></div>' +
           '<div class="' + sectionContainer + '"><div id="menu-grid" class="' + menuGrid + '"></div></div>' +
        '</div>' +
        '<div id="dynamic-view" style="display: none; padding: 2rem; font-family: monospace;"></div>' +
    '</div></div>';

  document.getElementById('home-btn')?.addEventListener('click', () => {
    activeTabId = null;
    document.getElementById('home-view')!.style.display = 'block';
    document.getElementById('dynamic-view')!.style.display = 'none';
    renderTabBar();
  });

  const tabBar = document.getElementById('main-tab-bar');
  tabBar?.addEventListener('tab-selected', (e: any) => {
    activeTabId = e.detail;
    document.getElementById('home-view')!.style.display = 'none';
    document.getElementById('dynamic-view')!.style.display = 'block';
    
    const tab = tabs.get(activeTabId);
    if (tab) tab.action();
    renderTabBar();
  });

  const menuGridEl = document.getElementById('menu-grid');
  MENU_ITEMS.forEach(item => {
    const el = document.createElement('div');
    el.className = menuItem;
    el.innerHTML = "<div>" + item.icon + "</div><div>" + item.label + "</div>";
    el.onclick = () => {
      tabs.set(item.id, item);
      activeTabId = item.id;
      item.action();
      renderTabBar();
    };
    menuGridEl?.appendChild(el);
  });
}

export function startApp() {
  initApp();
  init().catch(console.error);
}

if (process.env.NODE_ENV !== 'test') {
  startApp();
}
