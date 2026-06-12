import { ExbaGreeting } from './chrome/exba-greeting/index';
import { WasmModal } from './chrome/modal/index';
import { StatusBar } from './chrome/status-bar/index';
import { initApp } from './layouts/view-grid';
import { getExposedFunctions, setupBridge } from '../kernel/bridge/manager';
import { EXBA } from '../kernel/core/exba';
import { ReactiveStateProxy } from '../kernel/state/proxy';

/**
 * Polling helper to ensure the root application container is present in the DOM.
 */
export async function waitForApp() {
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
export function renderError(phase: string, message: string, error: unknown, onRetry?: () => void) {
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
export async function bootstrap() {
  // Register essential core components
  EXBA.register('exba-greeting', ExbaGreeting);
  EXBA.register('status-bar', StatusBar);
  EXBA.register('wasm-modal', WasmModal);

  await waitForApp();
  try {
    await setupBridge();
  } catch (e) {
    renderError('Bridge Init Failed', 'Could not initialize the WASM bridge.', e, () => bootstrap());
    throw e;
  }
  try {
    initApp();
  } catch (e) {
    renderError('Render Failed', 'The application UI failed to render.', e);
    throw e;
  }

  // Initialize meta-plugins and resolve dependencies
  await EXBA.initPlugins();
  await EXBA.readyPlugins();

  // Setup status-bar listener for showing modal
  const statusBar = document.getElementById('app-status-bar');
  statusBar?.addEventListener('show-modal', () => {
    const modal = document.createElement('wasm-modal');
    modal.setAttribute('functions', JSON.stringify(getExposedFunctions()));
    document.body.appendChild(modal);
  });

  EXBA.state = new ReactiveStateProxy({}, {}, true);
  return EXBA.state;
}
