import './style.css';
import './components/tab-bar/index';
import './components/status-bar/index';
import './components/examples/settings';
import './components/examples/profile';
import './components/examples/analytics';
import './components/examples/terminal';
import './components/examples/neofetch';
import './components/examples/kanban';
import './components/examples/activity-feed';
import './components/examples/accordion';
import './components/examples/drawer';
import './components/examples/code-block';
import './components/examples/date-picker';
import './components/examples/mindmap-cytoscape';
import './components/examples/mindmap-vis';
import './components/examples/browser-api/audio-demo';
import './components/examples/browser-api/canvas-demo';
import './components/examples/browser-api/storage-demo';
import './components/examples/browser-api/geo-demo';
import './components/examples/browser-api/notifications-demo';
import './components/examples/browser-api/fullscreen-demo';
import './components/examples/browser-api/clipboard-demo';
import './components/home/index';
import { MENU_ITEMS } from './layouts/constants';
import { initApp, renderTabBar } from './layouts/view-grid';
import { getExposedFunctions, setupBridge } from '../framework/bridge/manager';
import { ExbaGreeting } from './components/exba-greeting/index';
import { WasmModal } from './components/modal/index';
import { StatusBar } from './components/status-bar/index';
import { EXBA } from '../framework/core/exba';
import { Router } from '../framework/core/router';
import { ReactiveStateProxy } from '../framework/state/proxy';

// Initial registration of essential core components
EXBA.register('exba-greeting', ExbaGreeting);
EXBA.register('status-bar', StatusBar);
EXBA.register('wasm-modal', WasmModal);

/**
 * Polling helper to ensure the root application container is present in the DOM.
 * @returns A promise resolving to the #app element.
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
        return reject(
          new Error(
            `#app element not found after ${maxAttempts * 100}ms. Check that index.html contains a <div id="app"> element.`,
          ),
        );
      }
      setTimeout(check, 100);
    };
    check();
  });
}

/**
 * Renders a full-screen error boundary with a stack trace and optional retry.
 * @param phase The initialization phase where the error occurred.
 * @param message Descriptive error message.
 * @param error The raw error object.
 * @param onRetry Optional callback to restart the bootstrap process.
 */
function renderError(
  phase: string,
  message: string,
  error: unknown,
  onRetry?: () => void,
) {
  const app = document.getElementById('app');
  if (!app) return;

  const err = error instanceof Error ? error : new Error(String(error));
  const stack = err.stack
    ? err.stack
        .split('\n')
        .slice(0, 5)
        .map((l) => l.trim())
        .join('\n')
    : '';

  app.innerHTML = `
    <div style="
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #18181b; color: #e4e4e7; font-family: Inter, system-ui, sans-serif;
      padding: 2rem;
    ">
      <div style="max-width: 560px; width: 100%;">
        <div style="
          background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem;
        ">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
            <span style="color: #ef4444; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">
              ${phase}
            </span>
          </div>
          <p style="margin: 0 0 0.75rem; color: #d4d4d8; font-size: 0.9375rem; line-height: 1.5;">
            ${message}
          </p>
          ${
            stack
              ? `<pre style="
              margin: 0; padding: 0.75rem; background: #09090b; border-radius: 0.5rem;
              font-size: 0.75rem; font-family: 'SF Mono', 'Fira Code', monospace;
              color: #71717a; overflow-x: auto; line-height: 1.6; white-space: pre-wrap;
              word-break: break-word;
            ">${stack}</pre>`
              : ''
          }
        </div>
        ${
          onRetry
            ? `<button id="error-retry" style="
            padding: 0.5rem 1.25rem; background: #4f46e5; color: white; border: none;
            border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer;
            font-family: inherit; transition: background 0.15s;
          ">Retry</button>`
            : ''
        }
      </div>
    </div>
  `;

  if (onRetry) {
    const btn = app.querySelector<HTMLButtonElement>('#error-retry');
    btn?.addEventListener('click', onRetry);
    btn?.addEventListener('mouseenter', () => {
      if (btn) btn.style.background = '#4338ca';
    });
    btn?.addEventListener('mouseleave', () => {
      if (btn) btn.style.background = '#4f46e5';
    });
  }
}

/**
 * Orchestrates the application bootstrap process.
 * 1. Waits for DOM ready.
 * 2. Initializes the WASM bridge.
 * 3. Renders the shell layout.
 * 4. Initializes the global reactive state.
 * @returns The global appState proxy.
 */
async function bootstrap() {
  await waitForApp();

  try {
    await setupBridge();
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : 'Unknown error during WASM initialization';
    renderError(
      'Bridge Init Failed',
      `Could not initialize the WASM bridge. ${msg}`,
      e,
      () => bootstrap(),
    );
    throw e;
  }

  try {
    initApp();
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : 'Unknown error during app rendering';
    renderError(
      'Render Failed',
      `The application UI failed to render. ${msg}`,
      e,
    );
    throw e;
  }

  const appState = new ReactiveStateProxy(
    { counter: 0 },
    {
      onPropertyUpdate: (_prop, _value) => {
        // StatusBar now handles this via createEffect('counter')
      },
    },
  );

  return appState;
}

/**
 * Main application entry point. Registers routes and sets up global event listeners 
 * for navigation and tab management.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const appState = await bootstrap();

    const router = new Router('view-container');

    // Register Home Route
    router.register({
      path: '/',
      component: 'exba-home',
    });

    // Manually register a few to be sure
    router.register({ path: '/settings', component: 'exba-settings' });
    router.register({ path: '/profile', component: 'exba-profile' });
    router.register({ path: '/analytics', component: 'exba-analytics' });
    router.register({ path: '/terminal', component: 'exba-terminal' });
    router.register({ path: '/neofetch', component: 'exba-neofetch' });
    router.register({ path: '/kanban', component: 'exba-kanban' });
    router.register({ path: '/activity', component: 'exba-activity-feed' });
    router.register({ path: '/accordion', component: 'exba-accordion' });
    router.register({ path: '/drawer', component: 'exba-drawer' });
    router.register({ path: '/api-audio', component: 'exba-audio-demo' });
    router.register({ path: '/api-canvas', component: 'exba-canvas-demo' });
    router.register({ path: '/api-storage', component: 'exba-storage-demo' });
    router.register({ path: '/api-geo', component: 'exba-geo-demo' });
    router.register({ path: '/api-notifications', component: 'exba-notifications-demo' });
    router.register({ path: '/api-fullscreen', component: 'exba-fullscreen-demo' });
    router.register({ path: '/api-clipboard', component: 'exba-clipboard-demo' });

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
            const item = MENU_ITEMS.find((i) => i.id === id);
            if (item) tabs.set(id, { label: item.label, action: item.action });
          });
        } catch (e) {
          console.error('Failed to restore tabs', e);
        }
      }
      activeTabId = active || null;
    };

    loadTabs();

    const statusBar = document.getElementById('app-status-bar');
    if (statusBar) {
      statusBar.addEventListener('show-modal', () => {
        const modal = document.createElement('wasm-modal');
        modal.setAttribute('functions', JSON.stringify(getExposedFunctions()));
        document.body.appendChild(modal);
      });
    }

    const tabBar = document.getElementById('main-tab-bar') as HTMLElement & {
      addEventListener: (
        type: 'tab-selected',
        listener: (e: CustomEvent<string>) => void,
      ) => void;
    };
    if (tabBar) {
      tabBar.addEventListener('tab-selected', (e) => {
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
        if (tab) {
          tab.action();
        }
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
      const item = MENU_ITEMS.find((i) => i.id === id);
      if (item) {
        tabs.set(item.id, { label: item.label, action: item.action });
        activeTabId = item.id;
        item.action();
        router.navigate(`/${item.id}`);
        renderTabBar(tabs, activeTabId);
        saveTabs();
      }
    };

    (window as any).triggerExbaAction = async (actionId: string) => {
      try {
        await EXBA.callBridge('process_action', actionId);
      } catch (e) {
        console.error(`[EXBA] Bridge action "${actionId}" failed:`, e);
      }
    };

    (window as any).incrementCounter = () => {
      appState.value.counter++;
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
    return;
  }
});
