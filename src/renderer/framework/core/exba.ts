import type { ExbaBridge } from '../../bridge/types';
import { IRProcessor } from './processor';
import type { IRBundle } from './schema';
import { ResilienceManager } from './resilience';

export class EXBA {
  static bridge: ExbaBridge | null = null;
  private static _api: any = null;
  static DEBUG = true;
  static wasmModule: any = null;
  static subscriptions = new Map<string, Set<(val: any) => void>>();
  static eventListeners = new Map<string, Set<(data: any) => void>>();

  static log(phase: string, message: any) {
    if (EXBA.DEBUG) {
      console.log(
        `%c[EXBA IR][${phase}]`,
        'color: #818cf8; font-weight: bold;',
        message,
      );
    }
  }

  // ─── Signal System ──────────────────────────────────────────
  static subscribe(key: string, callback: (val: any) => void) {
    if (!EXBA.subscriptions.has(key)) {
      EXBA.subscriptions.set(key, new Set());
    }
    EXBA.subscriptions.get(key)!.add(callback);
    return () => EXBA.subscriptions.get(key)?.delete(callback);
  }

  static notify(key: string, value: any) {
    EXBA.subscriptions.get(key)?.forEach((cb) => {
      cb(value);
    });
  }

  // ─── Event System ───────────────────────────────────────────
  static addEventListener(event: string, callback: (data: any) => void) {
    if (!EXBA.eventListeners.has(event)) {
      EXBA.eventListeners.set(event, new Set());
    }
    EXBA.eventListeners.get(event)!.add(callback);
    return () => EXBA.eventListeners.get(event)?.delete(callback);
  }

  static emit(event: string, data?: any) {
    EXBA.eventListeners.get(event)?.forEach((cb) => {
      cb(data);
    });
  }

  // ─── WASM ───────────────────────────────────────────────────
  static async initWasm(initFn: any) {
    EXBA.log('WASM_INIT_START', {});
    try {
      EXBA.wasmModule = await initFn();
      EXBA.log('WASM_INIT_SUCCESS', { module: EXBA.wasmModule });
      return EXBA.wasmModule;
    } catch (e) {
      EXBA.log('WASM_INIT_ERROR', e);
      throw e;
    }
  }

  static setBridge(bridge: ExbaBridge) {
    EXBA.bridge = bridge;
    EXBA._api = EXBA.createApiProxy(bridge);
  }

  static get api(): any {
    if (!EXBA._api) {
      throw new Error('EXBA Bridge not initialized. Call setBridge first.');
    }
    return EXBA._api;
  }

  private static createApiProxy(bridge: ExbaBridge) {

    return new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          return async (...args: any[]) => {
            try {
              const result = await bridge.call(prop, ...args);
              ResilienceManager.reportSuccess();
              return result;
            } catch (e) {
              ResilienceManager.reportFailure(e);
              throw e;
            }
          };
        },
      },
    );
  }

  static register(tagName: string, componentClass: any) {
    if (customElements.get(tagName)) return;

    // Blueprint Validation
    const errors: string[] = [];
    if (!componentClass.props) errors.push('Missing static "props" definition');
    if (!componentClass.styles)
      errors.push('Missing static "styles" definition');
    if (!componentClass.prototype.render)
      errors.push('Missing "render()" method implementation');

    if (errors.length > 0) {
      console.error(
        `%c[EXBA Component Error] <${tagName}> violates Blueprint Rules:\n- ${errors.join('\n- ')}`,
        'color: #ef4444; font-weight: bold; background: rgba(239, 68, 68, 0.1); padding: 4px; border-radius: 4px;',
      );
      // We still register it to avoid crashing the whole app, but the developer is warned.
    }

    customElements.define(tagName, componentClass);
  }

  static async callBridge<T>(method: string, ...args: any[]): Promise<T> {
    if (!EXBA.bridge) {
      throw new Error('EXBA Bridge not initialized');
    }
    EXBA.log('BRIDGE_CALL', { method, args });
    const result = await EXBA.bridge.call<T>(method, ...args);
    EXBA.log('BRIDGE_RESPONSE', result);
    return result;
  }

  static dispatchIR(bundle: IRBundle) {
    IRProcessor.process(bundle);
  }

  // ─── Component Helpers ──────────────────────────────────────
  private static isBatching = false;
  private static pendingNotifications = new Set<string>();

  static createSignal<T>(initialValue: T, key?: string) {
    let val = initialValue;
    const signalKey = key || `sig_${Math.random().toString(36).substr(2, 9)}`;

    return {
      get value() { return val; },
      set value(newVal: T) {
        if (val === newVal) return;
        val = newVal;
        if (EXBA.isBatching) {
          EXBA.pendingNotifications.add(signalKey);
        } else {
          EXBA.notify(signalKey, newVal);
        }
      },
      subscribe: (cb: (v: T) => void) => EXBA.subscribe(signalKey, cb),
      key: signalKey
    };
  }

  static createComputed<T>(fn: () => T, dependencies: string[]) {
    const signal = EXBA.createSignal(fn());
    dependencies.forEach(dep => {
      EXBA.subscribe(dep, () => {
        signal.value = fn();
      });
    });
    return signal;
  }

  static batch(fn: () => void) {
    EXBA.isBatching = true;
    try {
      fn();
    } finally {
      EXBA.isBatching = false;
      const keys = Array.from(EXBA.pendingNotifications);
      EXBA.pendingNotifications.clear();
      keys.forEach(key => {
        // We don't have the "current value" here in a unified way if it's just keys,
        // but notify() handles calling subscribers. 
        // For ReactiveStateProxy integration, it works because notify triggers the cb 
        // which usually pulls from state.
        EXBA.notify(key, null); 
      });
    }
  }
}
