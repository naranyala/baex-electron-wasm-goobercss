import { IRProcessor } from './processor';
import type { IRBundle } from './schema';
import { ResilienceManager } from './resilience';
import type { ExbaBridge } from '../bridge/types';

/**
 * The core framework orchestrator for EXBA (Extended Browser Api).
 * Manages the WASM bridge, signal-based reactivity, event delegation, and component registration.
 */
export class EXBA {
  /** The communication bridge between TypeScript and Rust WASM. Provides raw `call` and `on` methods. */
  static bridge: ExbaBridge | null = null;
  /** Internal cached instance of the proxied API. */
  private static _api: any = null;
  /** Enables or disables internal framework logging. When true, lifecycle events and bridge calls are logged to the console. */
  static DEBUG = true;
  /** The initialized WASM module instance returned by the wasm-bindgen loader. */
  static wasmModule: any = null;
  /** Map of reactive keys to their respective sets of callback subscribers. */
  static subscriptions = new Map<string, Set<(val: any) => void>>();
  /** Map of event names to their respective sets of listener callbacks. */
  static eventListeners = new Map<string, Set<(data: any) => void>>();

  /**
   * Internal logging helper for framework lifecycle events.
   * Uses styled console output for better visibility during development.
   * @param phase The lifecycle phase or system component being logged.
   * @param message The data, error, or status message to log.
   */
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
  /**
   * Subscribes to changes for a specific reactive key.
   * Used by both global state and local component signals.
   * @param key The unique identifier for the reactive state.
   * @param callback Function to execute when the value changes.
   * @returns A cleanup function to unsubscribe and prevent memory leaks.
   */
  static subscribe(key: string, callback: (val: any) => void) {
    if (!EXBA.subscriptions.has(key)) {
      EXBA.subscriptions.set(key, new Set());
    }
    EXBA.subscriptions.get(key)!.add(callback);
    return () => EXBA.subscriptions.get(key)?.delete(callback);
  }

  /**
   * Notifies all subscribers of a change to a specific key.
   * Triggers synchronous execution of all registered callbacks.
   * @param key The unique identifier for the reactive state.
   * @param value The new value to broadcast.
   */
  static notify(key: string, value: any) {
    EXBA.subscriptions.get(key)?.forEach((cb) => {
      cb(value);
    });
  }

  // ─── Event System ───────────────────────────────────────────
  /**
   * Registers a global event listener.
   * EXBA events are decoupled from the DOM tree.
   * @param event The event name to listen for.
   * @param callback Function to execute when the event is emitted.
   * @returns A cleanup function to remove the listener.
   */
  static addEventListener(event: string, callback: (data: any) => void) {
    if (!EXBA.eventListeners.has(event)) {
      EXBA.eventListeners.set(event, new Set());
    }
    EXBA.eventListeners.get(event)!.add(callback);
    return () => EXBA.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emits a global event to all registered listeners.
   * Supports optional data payloads.
   * @param event The event name to emit.
   * @param data Optional payload to send with the event.
   */
  static emit(event: string, data?: any) {
    EXBA.eventListeners.get(event)?.forEach((cb) => {
      cb(data);
    });
  }

  // ─── WASM ───────────────────────────────────────────────────
  /**
   * Initializes the Rust WebAssembly engine.
   * Must be called during the application bootstrap phase.
   * @param initFn The WASM initialization function (usually `init` from wasm-pack).
   * @returns The initialized WASM module exports.
   * @throws Will throw if the WASM binary fails to load or compile.
   */
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

  /**
   * Attaches a bridge implementation to the framework.
   * Automatically creates a proxied API object for easy method invocation.
   * @param bridge The bridge object providing a `call` method.
   */
  static setBridge(bridge: ExbaBridge) {
    EXBA.bridge = bridge;
    EXBA._api = EXBA.createApiProxy(bridge);
  }

  /**
   * Provides access to the proxied WASM API.
   * Supports async/await for all exported Rust functions.
   * @throws {Error} If the bridge has not been initialized via `setBridge`.
   */
  static get api(): any {
    if (!EXBA._api) {
      throw new Error('EXBA Bridge not initialized. Call setBridge first.');
    }
    return EXBA._api;
  }

  /**
   * Internal helper to create a Proxy that maps method names to bridge invocations.
   * Handles error reporting and resilience monitoring automatically.
   * @param bridge The bridge to proxy.
   */
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

  /**
   * Registers a new custom element with the browser and validates its blueprint.
   * Ensures the component satisfies mandatory structure rules (props, styles, render).
   * @param tagName The custom element name (e.g., 'exba-button').
   * @param componentClass The class implementation extending ExbaComponent.
   */
  static register(tagName: string, componentClass: any) {
    if (customElements.get(tagName)) return;

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
    }

    customElements.define(tagName, componentClass);
  }

  /**
   * Low-level method to invoke a bridge call directly without using the API proxy.
   * Useful for dynamic method calls or internal framework tasks.
   * @param method The name of the WASM/Bridge method.
   * @param args Arguments to pass to the method.
   */
  static async callBridge<T>(method: string, ...args: any[]): Promise<T> {
    if (!EXBA.bridge) {
      throw new Error('EXBA Bridge not initialized');
    }
    EXBA.log('BRIDGE_CALL', { method, args });
    const result = await EXBA.bridge.call<T>(method, ...args);
    EXBA.log('BRIDGE_RESPONSE', result);
    return result;
  }

  /**
   * Dispatches an IR (Intermediate Representation) bundle to the processor.
   * This is the primary entry point for Rust -> TypeScript UI updates.
   * @param bundle The IR bundle containing commands and layout data.
   */
  static dispatchIR(bundle: IRBundle) {
    IRProcessor.process(bundle);
  }

  // ─── Component Helpers ──────────────────────────────────────
  /** Internal flag to track if signal notifications are currently being batched. */
  private static isBatching = false;
  /** Set of signal keys that have pending notifications during a batch. */
  private static pendingNotifications = new Map<string, any>();
  /** Internal flag to prevent tracking signal reads. */
  private static trackingDisabled = false;
  /** Stack of active tracking scopes for nested untrack calls. */
  private static trackingStack: boolean[] = [];
  /** Map of signal keys to their current values for batch notifications. */
  private static signalValues = new Map<string, any>();

  /**
   * Creates a reactive signal.
   * Signals are the atomic unit of state in EXBA.
   * @param initialValue The starting value of the signal.
   * @param key Optional unique identifier for the signal.
   * @returns An object with `get value`, `set value`, and `subscribe`.
   */
  static createSignal<T>(initialValue: T, key?: string) {
    let val = initialValue;
    const signalKey = key || `sig_${Math.random().toString(36).substr(2, 9)}`;
    EXBA.signalValues.set(signalKey, val);

    return {
      /** Returns the current value of the signal. */
      get value() {
        if (!EXBA.trackingDisabled) {
          EXBA.trackDependency(signalKey);
        }
        return val;
      },
      /** Updates the signal value and notifies subscribers. Supports batching. */
      set value(newVal: T) {
        if (val === newVal) return;
        val = newVal;
        EXBA.signalValues.set(signalKey, newVal);
        if (EXBA.isBatching) {
          EXBA.pendingNotifications.set(signalKey, newVal);
        } else {
          EXBA.notify(signalKey, newVal);
        }
      },
      /** Registers a listener for this specific signal. */
      subscribe: (cb: (v: T) => void) => EXBA.subscribe(signalKey, cb),
      /** The unique key assigned to this signal. */
      key: signalKey
    };
  }

  /**
   * Tracks which signal keys are accessed during a function execution.
   * Used by memo and createComputed for auto-tracking dependencies.
   * @param fn The function to track dependencies for.
   * @returns An array of signal keys that were accessed.
   */
  static trackDependencies(fn: () => void): string[] {
    const deps = new Set<string>();
    const prevTracking = EXBA.trackingDisabled;
    const prevStack = [...EXBA.trackingStack];

    EXBA.trackingStack.push(false);
    EXBA.trackingDisabled = false;

    // Temporarily replace trackDependency to collect deps
    const originalTrack = EXBA.trackDependency;
    EXBA.trackDependency = (key: string) => deps.add(key);

    try {
      fn();
    } finally {
      EXBA.trackDependency = originalTrack;
      EXBA.trackingStack.length = 0;
      EXBA.trackingStack.push(...prevStack);
      EXBA.trackingDisabled = prevTracking;
    }

    return Array.from(deps);
  }

  /**
   * Internal method to track a signal dependency.
   * @param key The signal key being accessed.
   */
  private static trackDependency(_key: string) {
    // Default no-op, replaced temporarily by trackDependencies
  }

  /**
   * Reads a signal value without creating a subscription.
   * Useful inside effects or memos when you want to read without tracking.
   * @param signal The signal to read.
   * @returns The current value.
   */
  static untrack<T>(signal: { value: T }): T {
    EXBA.trackingStack.push(EXBA.trackingDisabled);
    EXBA.trackingDisabled = true;
    try {
      return signal.value;
    } finally {
      EXBA.trackingDisabled = EXBA.trackingStack.pop()!;
    }
  }

  /**
   * Creates a lazy memo that only recalculates when read.
   * Dependencies are auto-tracked on first execution.
   * Only notifies subscribers if the value actually changed.
   * @param fn The derivation function.
   * @returns A read-only signal-like object.
   */
  static memo<T>(fn: () => T): { readonly value: T; readonly key: string } {
    let val: T;
    let dirty = true;
    let deps: string[] = [];
    const unsubscribers: (() => void)[] = [];
    const signalKey = `memo_${Math.random().toString(36).substr(2, 9)}`;

    const recompute = () => {
      // Track dependencies while computing
      const trackedDeps: string[] = [];
      const prevTracking = EXBA.trackingDisabled;
      const prevStack = [...EXBA.trackingStack];
      EXBA.trackingStack.push(false);
      EXBA.trackingDisabled = false;

      const originalTrack = EXBA.trackDependency;
      EXBA.trackDependency = (key: string) => trackedDeps.push(key);

      let newVal: T;
      try {
        newVal = fn();
      } finally {
        EXBA.trackDependency = originalTrack;
        EXBA.trackingStack.length = 0;
        EXBA.trackingStack.push(...prevStack);
        EXBA.trackingDisabled = prevTracking;
      }

      // Only notify if value changed
      if (val !== newVal) {
        val = newVal;
        EXBA.signalValues.set(signalKey, newVal);
        EXBA.notify(signalKey, newVal);
      }

      dirty = false;

      // Re-subscribe to new dependencies if they changed
      if (JSON.stringify(deps) !== JSON.stringify(trackedDeps)) {
        unsubscribers.forEach(unsub => unsub());
        unsubscribers.length = 0;
        deps = trackedDeps;
        deps.forEach(dep => {
          const unsub = EXBA.subscribe(dep, () => { dirty = true; recompute(); });
          unsubscribers.push(unsub);
        });
      }
    };

    // Initial computation and dependency tracking
    recompute();

    return {
      get value() {
        if (dirty) recompute();
        return val;
      },
      key: signalKey
    };
  }

  /**
   * Creates a computed signal that automatically updates when dependencies change.
   * Auto-tracks dependencies on first execution.
   * Only notifies if value actually changed.
   * @param fn The derivation function that produces the computed value.
   * @param _deps Optional explicit dependencies (auto-tracked if omitted).
   */
  static createComputed<T>(fn: () => T, _deps?: string[]) {
    let val: T = fn();
    const signalKey = `computed_${Math.random().toString(36).substr(2, 9)}`;
    EXBA.signalValues.set(signalKey, val);
    const unsubscribers: (() => void)[] = [];

    const update = () => {
      const newVal = fn();
      if (val !== newVal) {
        val = newVal;
        EXBA.signalValues.set(signalKey, newVal);
        EXBA.notify(signalKey, newVal);
      }
    };

    // Auto-track or use explicit deps
    const deps = _deps || EXBA.trackDependencies(fn);
    deps.forEach(dep => {
      const unsub = EXBA.subscribe(dep, update);
      unsubscribers.push(unsub);
    });

    return {
      get value() { return val; },
      /** Cleanup subscriptions */
      dispose() { unsubscribers.forEach(unsub => unsub()); },
      key: signalKey
    };
  }

  /**
   * Sets up an explicit listener on a signal that runs outside of effects.
   * Returns a dispose function to remove the listener.
   * @param signal The signal to listen to.
   * @param fn The callback to run when the signal changes. Receives new and old values.
   * @returns A dispose function.
   */
  static on<T>(
    signal: { key: string; value: T },
    fn: (newVal: T, oldVal: T | undefined) => void
  ): () => void {
    let prevValue: T | undefined;
    // Capture current value as "old" for first notification
    prevValue = EXBA.signalValues.get(signal.key);

    const unsub = EXBA.subscribe(signal.key, (newVal: T) => {
      fn(newVal, prevValue);
      prevValue = newVal;
    });

    return unsub;
  }

  /**
   * Creates a reactive effect that automatically re-runs when its dependencies change.
   * Dependencies are auto-tracked on first execution.
   * Returns a dispose function to stop the effect.
   * @param fn The effect function to run.
   * @returns A dispose function.
   */
  static createEffect(fn: () => void | (() => void)): () => void {
    let cleanup: (() => void) | undefined;
    let deps: string[] = [];
    const unsubscribers: (() => void)[] = [];
    let disposed = false;

    const run = () => {
      if (disposed) return;

      // Run previous cleanup
      cleanup?.();

      // Track dependencies while executing
      const trackedDeps: string[] = [];
      const prevTracking = EXBA.trackingDisabled;
      const prevStack = [...EXBA.trackingStack];
      EXBA.trackingStack.push(false);
      EXBA.trackingDisabled = false;

      const originalTrack = EXBA.trackDependency;
      EXBA.trackDependency = (key: string) => trackedDeps.push(key);

      try {
        const result = fn();
        if (typeof result === 'function') {
          cleanup = result;
        }
      } finally {
        EXBA.trackDependency = originalTrack;
        EXBA.trackingStack.length = 0;
        EXBA.trackingStack.push(...prevStack);
        EXBA.trackingDisabled = prevTracking;
      }

      // Re-subscribe to dependencies if changed
      if (JSON.stringify(deps) !== JSON.stringify(trackedDeps)) {
        unsubscribers.forEach(unsub => unsub());
        unsubscribers.length = 0;
        deps = trackedDeps;
        deps.forEach(dep => {
          const unsub = EXBA.subscribe(dep, run);
          unsubscribers.push(unsub);
        });
      }
    };

    // Initial run
    run();

    return () => {
      disposed = true;
      cleanup?.();
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Batches multiple signal updates together to prevent intermediate re-renders.
   * Notifications are deferred until the provided function completes.
   * @param fn The function containing multiple synchronous signal updates.
   */
  static batch(fn: () => void) {
    EXBA.isBatching = true;
    try {
      fn();
    } finally {
      EXBA.isBatching = false;
      const entries = Array.from(EXBA.pendingNotifications.entries());
      EXBA.pendingNotifications.clear();
      entries.forEach(([key, value]) => {
        EXBA.notify(key, value);
      });
    }
  }

  // ─── Short Aliases ──────────────────────────────────────────
  /** Alias for `createSignal` */
  static signal = EXBA.createSignal;
  /** Alias for `createComputed` */
  static computed = EXBA.createComputed;
}
