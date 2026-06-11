import { EXBA } from '../core/exba';
import { ResilienceManager } from '../core/resilience';

/**
 * Configuration options for the ReactiveStateProxy.
 */
export interface StateOptions {
  /** Callback triggered whenever any part of the state updates. */
  onUpdate?: (newState: any) => void;
  /** Callback triggered when a specific property is updated. */
  onPropertyUpdate?: (prop: string, value: any, oldValue: any) => void;
}

/**
 * A proxy-based state management system that provides deep reactivity.
 * It automatically synchronizes state changes with the Rust WASM backend
 * and notifies EXBA signal subscribers.
 */
export class ReactiveStateProxy {
  private state: any;
  private options: StateOptions;
  private proxy: any;

  /**
   * Creates a new ReactiveStateProxy.
   * @param initialState The initial data object for the state.
   * @param options Lifecycle and update hooks.
   * @param autoSync Whether to immediately pull the current state from WASM.
   */
  constructor(
    initialState: any = {},
    options: StateOptions = {},
    autoSync = true,
  ) {
    // If only one argument is provided and it has StateOptions keys, swap them.
    // This handles both new ReactiveStateProxy(options) and new ReactiveStateProxy(initial, options)
    if (
      arguments.length === 1 &&
      (initialState.onUpdate || initialState.onPropertyUpdate)
    ) {
      this.options = initialState;
      this.state = {};
    } else {
      this.state = initialState;
      this.options = options;
    }

    this.proxy = this.createDeepProxy(this.state);
    if (autoSync) {
      this.sync();
    }
  }

  /**
   * Recursively creates a Proxy to intercept property access and mutations.
   * @param target The object to proxy.
   * @returns A deep proxy of the target object.
   */
  private createDeepProxy(target: any): any {
    const handler: ProxyHandler<any> = {
      get: (obj, prop) => {
        const value = Reflect.get(obj, prop);
        if (value !== null && typeof value === 'object') {
          return this.createDeepProxy(value);
        }
        return value;
      },
      set: (obj, prop, value) => {
        const oldValue = obj[prop];
        if (oldValue === value) return true;

        const result = Reflect.set(obj, prop, value);

        // Notify and Sync
        this.handleUpdate(prop as string, value, oldValue);

        return result;
      },
    };
    return new Proxy(target, handler);
  }

  /**
   * Internal handler for property updates.
   * Performs three tasks:
   * 1. Synchronizes the change to the WASM app state.
   * 2. Executes user-provided lifecycle callbacks.
   * 3. Notifies EXBA signal subscribers.
   */
  private handleUpdate(prop: string, value: any, oldValue: any) {
    // 1. Sync with WASM if module is healthy
    if (ResilienceManager.isWasmHealthy()) {
      try {
        const patch = JSON.stringify({ [prop]: value });
        const wasmUpdate =
          (window as any).wasm_update_app_state ||
          EXBA.wasmModule.wasm_update_app_state;
        if (typeof wasmUpdate === 'function') {
          wasmUpdate(patch);
        }
        ResilienceManager.reportSuccess();
      } catch (e) {
        ResilienceManager.reportFailure(e);
      }
    }

    // 2. Execute callbacks
    this.options.onPropertyUpdate?.(prop, value, oldValue);
    this.options.onUpdate?.(this.state);

    // 3. Notify EXBA subscribers
    EXBA.notify(prop, value);
  }

  /**
   * Forces a synchronization from the WASM state into the local TypeScript state.
   */
  public sync() {
    if (ResilienceManager.isWasmHealthy()) {
      try {
        const wasmState = EXBA.wasmModule.wasm_get_app_state();
        if (wasmState) {
          Object.assign(this.state, wasmState);
        }
        ResilienceManager.reportSuccess();
      } catch (e) {
        ResilienceManager.reportFailure(e);
      }
    }
  }

  /**
   * Returns the proxied state object for reading and writing.
   */
  get value() {
    return this.proxy;
  }

  /**
   * Replaces the entire state with a new object.
   * This also triggers synchronization with WASM and notifies all top-level subscribers.
   */
  set value(newFullState: any) {
    if (ResilienceManager.isWasmHealthy()) {
      try {
        const patch = JSON.stringify(newFullState);
        const wasmUpdate =
          (window as any).wasm_update_app_state ||
          EXBA.wasmModule.wasm_update_app_state;
        if (typeof wasmUpdate === 'function') {
          wasmUpdate(patch);
        }
        ResilienceManager.reportSuccess();
      } catch (e) {
        ResilienceManager.reportFailure(e);
      }
    }

    Object.assign(this.state, newFullState);
    this.options.onUpdate?.(this.state);

    // Notify for all top level keys
    Object.keys(newFullState).forEach((key) => {
      EXBA.notify(key, newFullState[key]);
    });
  }
}
