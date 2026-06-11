import './style.css';
import './components/tab-bar/index';
import './components/status-bar/index';
import './components/home/index';

// Essential Shell Components
import { ExbaGreeting } from './components/exba-greeting/index';
import { WasmModal } from './components/modal/index';
import { StatusBar } from './components/status-bar/index';

// Example Plugins (Architecture Split)
import { EXAMPLE_REGISTRY } from '../examples/registry';
// SIDE EFFECT IMPORTS (Web Component Registration)
import '../examples/ui/settings';
import '../examples/ui/profile';
import '../examples/integrations/analytics';
import '../examples/ui/terminal';
import '../examples/ui/neofetch';
import '../examples/ui/kanban';
import '../examples/ui/activity-feed';
import '../examples/ui/accordion';
import '../examples/ui/drawer';
import '../examples/ui/code-block';
import '../examples/ui/date-picker';
import '../examples/integrations/mindmap-cytoscape';
import '../examples/integrations/mindmap-vis';
import '../examples/browser/audio-demo';
import '../examples/browser/canvas-demo';
import '../examples/browser/storage-demo';
import '../examples/browser/geo-demo';
import '../examples/integrations/leaflet-turf';
import '../examples/browser/notifications-demo';
import '../examples/browser/fullscreen-demo';
import '../examples/browser/clipboard-demo';

import { initApp, renderTabBar } from './layouts/view-grid';
import { getExposedFunctions, setupBridge } from '../framework/bridge/manager';
import { EXBA } from '../framework/core/exba';
import { Router } from '../framework/core/router';
import { ReactiveStateProxy } from '../framework/state/proxy';

// Initial registration of essential core components
EXBA.register('exba-greeting', ExbaGreeting);
EXBA.register('status-bar', StatusBar);
EXBA.register('wasm-modal', WasmModal);

/**
 * Polling helper to ensure the root application container is present in the DOM.
 */
async function waitForApp() {
  return new Promise<HTMLElement>((resolve, reject) => {
    const el = document.getElementById('app');
    if (el) return resolve(el);

    let attempts = 0;
    const maxAttempts = 50;
    const check = () => {
      const el = document.getElementById('app');
      if (el) return resolve(el);
      if (++attempts >= maxAttempts) {
        return reject(new Error(`#app element not found after ${maxAttempts * 100}ms.`));
      }
      setTimeout(check, 100);
    };
    check();
  });
}

/**
 * Renders a full-screen error boundary.
 */
function renderError(phase: string, message: string, error: unknown, onRetry?: () => void) {
  const app = document.getElementById('app');
  if (!app) return;
  const err = error instanceof Error ? error : new Error(String(error));
  const stack = err.stack ? err.stack.split('\n').slice(0, 5).join('\n') : '';

  app.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #18181b; color: #e4e4e7; font-family: Inter, sans-serif; padding: 2rem;">
      <div style="max-width: 560px; width: 100%;">
        <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem;">
          <div style="color: #ef4444; font-weight: 600; font-size: 0.875rem; text-transform: uppercase;">${phase}</div>
          <p style="margin: 0.75rem 0; color: #d4d4d8; font-size: 0.9375rem;">${message}</p>
          ${stack ? `<pre style="padding: 0.75rem; background: #09090b; border-radius: 0.5rem; font-size: 0.75rem; color: #71717a; overflow-x: auto;">${stack}</pre>` : ''}
        </div>
        ${onRetry ? `<button id="error-retry">Retry</button>` : ''}
      </div>
    </div>
  `;
  if (onRetry) app.querySelector('#error-retry')?.addEventListener('click', onRetry);
}

/**
 * Orchestrates the application bootstrap process.
 */
async function bootstrap() {
  await waitForApp();
  try { await setupBridge(); } catch (e) {
    renderError('Bridge Init Failed', 'Could not initialize the WASM bridge.', e, () => bootstrap());
    throw e;
  }
  try { initApp(); } catch (e) {
    renderError('Render Failed', 'The application UI failed to render.', e);
    throw e;
  }
  return new ReactiveStateProxy({ counter: 0 });
}

/**
 * Main application entry point.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await bootstrap();
    const router = new Router('view-container');

    // 1. Register Home
    router.register({ path: '/', component: 'exba-home' });

    // 2. Automatically register all plugin routes from the Registry
    EXAMPLE_REGISTRY.forEach(example => {
        router.register({ 
            path: example.id === 'home' ? '/' : `/${example.id}`, 
            component: example.component 
        });
    });

    const tabs = new Map<string, { label: string; action: () => void }>();
    let activeTabId: string | null = null;

    const saveTabs = () => {
      localStorage.setItem('exba-tabs', JSON.stringify(Array.from(tabs.keys())));
      localStorage.setItem('exba-active-tab', activeTabId || '');
    };

    const loadTabs = () => {
      const saved = localStorage.getItem('exba-tabs');
      const active = localStorage.getItem('exba-active-tab');
      if (saved) {
        try {
          const ids = JSON.parse(saved) as string[];
          ids.forEach((id) => {
            const item = EXAMPLE_REGISTRY.find((i) => i.id === id);
            if (item) tabs.set(id, { label: item.label, action: () => item.action(document.getElementById('view-container')!) });
          });
        } catch (e) { console.error('Failed to restore tabs', e); }
      }
      activeTabId = active || null;
    };

    loadTabs();

    const statusBar = document.getElementById('app-status-bar');
    statusBar?.addEventListener('show-modal', () => {
        const modal = document.createElement('wasm-modal');
        modal.setAttribute('functions', JSON.stringify(getExposedFunctions()));
        document.body.appendChild(modal);
    });

    const tabBar = document.getElementById('main-tab-bar') as any;
    if (tabBar) {
      tabBar.addEventListener('tab-selected', (e: any) => {
        const tabId = e.detail;
        if (tabId === 'home') {
          activeTabId = null;
          router.navigate('/');
          renderTabBar(tabs, null);
          saveTabs();
          return;
        }
        activeTabId = tabId;
        const tab = tabs.get(tabId);
        if (tab) tab.action();
        router.navigate(`/${tabId}`);
        renderTabBar(tabs, activeTabId);
        saveTabs();
      });

      tabBar.addEventListener('tab-closed', (e: any) => {
        const tabId = e.detail;
        tabs.delete(tabId);
        if (activeTabId === tabId) {
          activeTabId = null;
          router.navigate('/');
          renderTabBar(tabs, null);
        } else {
          renderTabBar(tabs, activeTabId);
        }
        saveTabs();
      });
    }

    (window as any).dispatchMenuAction = (id: string) => {
      const item = EXAMPLE_REGISTRY.find((i) => i.id === id);
      if (item) {
        tabs.set(item.id, { label: item.label, action: () => item.action(document.getElementById('view-container')!) });
        activeTabId = item.id;
        item.action(document.getElementById('view-container')!);
        router.navigate(`/${item.id}`);
        renderTabBar(tabs, activeTabId);
        saveTabs();
      }
    };

    // Initial navigation
    if (activeTabId && tabs.has(activeTabId)) {
      const activeTab = tabs.get(activeTabId);
      activeTab?.action();
      router.navigate(`/${activeTabId}`);
      renderTabBar(tabs, activeTabId);
    } else {
      router.navigate('/');
      renderTabBar(tabs, null);
    }
  } catch (e) {
    console.error('[EXBA] Fatal initialization error:', e);
  }
});
