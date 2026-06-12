import { Context, consumeContext } from './context';
import { patch, type TemplateResult } from './dom';
import { EXBA } from './exba';

/**
 * Base interface for internal component state.
 */
export interface ComponentState {
  [key: string]: any;
}

/**
 * Definition of component attributes/properties and their expected types.
 */
export interface ComponentProps {
  [key: string]: 'string' | 'number' | 'boolean' | 'json';
}

/**
 * The base class for all EXBA web components.
 * Provides shadow DOM encapsulation, signal-based reactivity, 
 * scoped styling, and lifecycle hooks.
 */
export abstract class ExbaComponent extends HTMLElement {
  protected activeSubscriptions: Array<() => void> = [];
  protected state: ComponentState = {};
  protected renderDependencies: Set<string> = new Set();
  protected depSubscriptions: Map<string, () => void> = new Map();

  /**
   * Define the properties the component should observe.
   * Example: static props = { count: 'number', name: 'string' };
   */
  static props: ComponentProps = {};

  /**
   * Define the scoped styles for the component as an object or a string.
   * If object: Key is class name, Value is CSS rules.
   * If string: Raw CSS rules.
   */
  static styles: string | Record<string, string> = {};

  /**
   * Define if the component should use Shadow DOM.
   * Defaults to true.
   */
  static useShadow = true;

  /**
   * Initializes the component and optionally attaches the shadow root.
   */
  constructor() {
    super();
    if ((this.constructor as typeof ExbaComponent).useShadow) {
      this.attachShadow({ mode: 'open' });
    }
    // Initialize state as a reactive proxy.
    this.state = EXBA.reactive({}, `state_${Math.random().toString(36).substr(2, 5)}`);
  }

  /**
   * Returns an array of attribute names to monitor for changes.
   * Derived from the static `props` definition and includes lowercase/kebab-case variations.
   */
  static get observedAttributes() {
    const keys = Object.keys((this as any).props || {});
    const attrs = new Set<string>();
    keys.forEach(key => {
      attrs.add(key);
      attrs.add(key.toLowerCase());
      const kebab = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      attrs.add(kebab);
    });
    return Array.from(attrs);
  }

  /**
   * Web Component lifecycle hook for attribute changes.
   * Automatically parses the attribute value based on the `props` definition.
   */
  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;

    const props = (this.constructor as typeof ExbaComponent).props;
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const propKey = Object.keys(props).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanName) || name;
    const propType = props[propKey];
    let value: any = newValue;

    if (propType) {
      switch (propType) {
        case 'number':
          value = Number(newValue);
          break;
        case 'boolean':
          value = newValue === 'true' || newValue === '';
          break;
        case 'json':
          try {
            value = JSON.parse(newValue || 'null');
          } catch {
            value = null;
          }
          break;
      }
    }

    this.setState({ [propKey]: value });
  }

  /**
   * The core rendering method. Must be implemented by subclasses.
   * Should return a string of HTML or a TemplateResult (from `html` tagged templates).
   */
  abstract render(): string | TemplateResult;

  /**
   * Lifecycle hook called when the component is first added to the DOM.
   */
  protected onMount(): void {}
  
  /**
   * Lifecycle hook called after the state has updated and a re-render has been triggered.
   * @param _changedProps List of property names that were modified.
   */
  protected onUpdate(_changedProps: string[]): void {}
  
  /**
   * Lifecycle hook called when the component is removed from the DOM.
   */
  protected onUnmount(): void {}

  /**
   * Internal Web Component hook. Triggers the first render and calls `onMount`.
   */
  connectedCallback() {
    this.safeUpdate();
    this.onMount();
  }

  /**
   * Internal Web Component hook. Calls `onUnmount` and performs cleanup.
   */
  disconnectedCallback() {
    this.onUnmount();
    this.cleanup();
  }

  /**
   * Cleans up all active framework subscriptions to prevent memory leaks.
   */
  private cleanup() {
    this.activeSubscriptions.forEach((unsub) => unsub());
    this.activeSubscriptions = [];
  }

  /**
   * Updates the component state.
   * If the state property is a signal setter, it updates the signal value.
   * @param newState Partial state object to merge.
   */
  setState(newState: Partial<ComponentState>) {
    const changedProps = Object.keys(newState);
    // Track pending changed props for onUpdate BEFORE triggering mutations
    (this as any)._pendingChangedProps = [
        ...((this as any)._pendingChangedProps || []),
        ...changedProps
    ];

    for (const [key, value] of Object.entries(newState)) {
      const current = this.state[key];
      if (typeof current === 'function' && (current as any)._isSignalSetter) {
        // It's a signal setter function from the tuple API
        (current as any)(value);
      } else {
        // Otherwise, just set it (might be a new signal tuple or a plain value)
        this.state[key] = value;
      }
    }
  }

  /**
   * Registers a reactive effect that is automatically cleaned up on unmount.
   * @param key The signal key to subscribe to.
   * @param callback The function to run when the signal changes.
   * @returns An unsubscription function.
   */
  protected createEffect(key: string, callback: (val: any) => void) {
    const unsub = EXBA.subscribe(key, (val) => {
        callback(val);
    });
    this.activeSubscriptions.push(unsub);
    return unsub;
  }

  /**
   * Dispatches a custom event from the component.
   * @param eventName Name of the event.
   * @param detail Optional payload for the event.
   */
  public emit(eventName: string, detail?: any) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Creates a signal that is synchronized with a global WASM AppState key.
   * @param key The global state key.
   * @returns A signal whose value reflects the global state.
   */
  protected useWasmState<T>(key: string) {
    const initialValue = EXBA.state?.value?.[key];
    const [getter, setter, meta] = this.useSignal(initialValue, `wasm_${key}`);
    
    const unsub = EXBA.subscribe(key, (val: T) => {
      setter(val);
    });
    this.activeSubscriptions.push(unsub);
    
    // Also allow updating the global state when this signal changes
    this.createEffect(meta.key, (val) => {
      if (EXBA.state && EXBA.state.value) {
        EXBA.state.value[key] = val;
      }
    });
    
    return [getter, setter, meta];
  }

  /**
   * Retrieves the inner HTML of a specific slot.
   * @param name Name of the slot (defaults to 'default').
   */
  protected getSlotContent(name: string = 'default'): string {
    const root = this.shadowRoot || this;
    const slot = root.querySelector(`slot[name="${name}"]`);
    return (slot as any)?.innerHTML || '';
  }

  /**
   * Consumes a context value from the nearest provider in the DOM hierarchy.
   * @param context The context object or string ID.
   */
  protected useContext<T>(context: string | { id: string }): T {
    const id = typeof context === 'string' ? context : context.id;
    const value = consumeContext<T>(this, id);
    if (value !== undefined) return value;
    return EXBA.useContext<T>(context);
  }

  private _isUpdating = false;

  /**
   * Performs a patched DOM update by executing `render()` and applying changes.
   * Handles scoped style injection and error boundaries.
   * Automatically tracks signal dependencies to schedule future updates.
   */
  protected async safeUpdate() {
    if (this._isUpdating) return;
    const root = this.shadowRoot || this;
    if (!root) return;

    this._isUpdating = true;
    try {
      const isFirstRender = this.renderDependencies.size === 0;
      
      // 1. Track dependencies during render
      const deps = EXBA.trackDependencies(() => this.render());
      
      const changedProps = (this as any)._pendingChangedProps || [];
      (this as any)._pendingChangedProps = [];

      // 2. Update signal subscriptions
      this.updateDependencies(deps);

      const htmlOutput = this.render();

      // Generate style block from styles object or string
      const stylesObj = (this.constructor as typeof ExbaComponent).styles;
      let styleContent = '';
      if (typeof stylesObj === 'string') {
        styleContent = stylesObj;
      } else if (stylesObj) {
        styleContent = Object.entries(stylesObj)
          .map(([cls, rules]) => `.${cls} { ${rules} }`)
          .join('\n');
      }
      const styleTag = styleContent ? `<style>${styleContent}</style>` : '';

      if (typeof htmlOutput === 'string') {
        const fullHTML = `${styleTag}${htmlOutput}`;
        patch(root as any, fullHTML);
      } else {
        // If it's a TemplateResult, we prepend the style tag to the first string segment
        const res = htmlOutput as any;
        const newStrings = [...res.strings];
        newStrings[0] = styleTag + newStrings[0];
        patch(root as any, { ...res, strings: newStrings });
      }

      if (!isFirstRender) {
        this.onUpdate(changedProps);
      }
    } catch (e) {
      console.error(
        `[EXBA] Render error in <${this.tagName.toLowerCase()}>:`,
        e,
      );
      root.innerHTML = `
        <div style="padding: 0.5rem; color: #ef4444; font-size: 0.8125rem; font-family: monospace;">
          Render error: ${e instanceof Error ? e.message : String(e)}
        </div>
      `;
    } finally {
      this._isUpdating = false;
    }
  }

  /**
   * Synchronizes the component's signal subscriptions with the current render dependencies.
   * @param currentDeps List of signal keys accessed during the last render.
   */
  private updateDependencies(currentDeps: string[]) {
    const newDeps = new Set(currentDeps);
    
    // Remove subscriptions for signals no longer used
    for (const [key, unsub] of this.depSubscriptions.entries()) {
      if (!newDeps.has(key)) {
        unsub();
        this.depSubscriptions.delete(key);
      }
    }

    // Add subscriptions for new signals
    for (const key of newDeps) {
      if (!this.depSubscriptions.has(key)) {
        const unsub = EXBA.subscribe(key, () => {
          this.safeUpdate();
        });
        this.depSubscriptions.set(key, unsub);
      }
    }
    
    this.renderDependencies = newDeps;
  }

  /**
   * Convenience method to link a global EXBA signal directly to a local state property.
   * @param key The global signal key.
   */
  protected subscribeToState(key: string) {
    if (EXBA.state && EXBA.state.value && EXBA.state.value[key] !== undefined) {
      this.state[key] = EXBA.state.value[key];
    }
    const unsub = EXBA.subscribe(key, (val) => {
      this.setState({ [key]: val });
    });
    this.activeSubscriptions.push(unsub);
  }

  /**
   * Directly invokes a WASM function through the bridge.
   * @param method Method name.
   * @param args Arguments.
   */
  protected async callWasm<T>(method: string, ...args: any[]): Promise<T> {
    return EXBA.callBridge<T>(method, ...args);
  }

  /**
   * Connects a component to a specific WASM store and returns signals for requested keys.
   * @param storeId The ID of the store to connect to.
   * @param keys Array of keys to track from that store.
   * @returns A map of signals corresponding to the requested keys.
   */
  protected useWasmStore<K extends string>(storeId: string, keys: K[]) {
    const store = EXBA.getStore(storeId);
    if (!store) {
      console.warn(`[EXBA] Store ${storeId} not initialized yet.`);
      return {} as Record<K, any>;
    }

    const signals = {} as Record<K, any>;
    
    for (const key of keys) {
      // Create a local signal that mirrors the store value
      const [getter, setter, meta] = this.useSignal(store[key], `${storeId}_${key}`);
      
      // Sync from Store -> Signal
      const unsub = EXBA.subscribe(`${storeId}_${key}`, (val) => {
        setter(val);
      });
      this.activeSubscriptions.push(unsub);
      
      // Sync from Signal -> Store (Optional: depending on if Rust allows writes)
      this.createEffect(meta.key, (val) => {
        this.callWasm('update_store', { storeId, key, value: val });
      });
      
      signals[key] = [getter, setter, meta];
    }
    
    return signals;
  }

  // ─── Functional Hooks ──────────────────────────────────────
  
  /**
   * Creates a reactive signal that is scoped to this component's lifecycle.
   * Automatically triggers a re-render when the signal value changes.
   * @param initialValue Starting value.
   * @param key Optional unique key.
   * @returns The signal tuple [getter, setter, { key }].
   */
  protected useSignal<T>(initialValue: T, key?: string) {
    const [getter, setter, meta] = EXBA.signal(initialValue, key);
    this.createEffect(meta.key, (_val) => {
        this.safeUpdate();
    });
    return [getter, setter, meta];
  }

  /**
   * Creates a lazy memoized value that only recalculates when read.
   * Dependencies are auto-tracked. Only triggers re-render if value changes.
   * @param fn The derivation function.
   * @returns A tuple containing the getter function and metadata.
   */
  protected useMemo<T>(fn: () => T) {
    const [getter, meta] = EXBA.memo(fn);
    this.createEffect(meta.key, () => {
      this.safeUpdate();
    });
    return [getter, meta];
  }

  /**
   * Creates a reactive effect scoped to this component's lifecycle.
   * Auto-tracks dependencies. Cleans up on unmount.
   * @param fn The effect function.
   */
  protected useEffect(fn: () => void | (() => void)) {
    const unsub = EXBA.createEffect(fn);
    this.activeSubscriptions.push(unsub);
    return unsub;
  }

  /**
   * Reads a signal value without creating a subscription.
   * Use inside effects or memos to avoid unwanted tracking.
   * @param signal The signal to read.
   */
  protected untrack<T>(signal: { value: T }): T {
    return EXBA.untrack(signal);
  }
}

/**
 * Definition for creating an EXBA component without using decorators.
 */
export interface ComponentDefinition<T = any> {
  tagName: string;
  props?: ComponentProps;
  styles?: string | Record<string, string>;
  useShadow?: boolean;
  state?: Record<string, any> | (() => Record<string, any>);
  methods?: Record<string, (this: T, ...args: any[]) => any>;
  listeners?: Array<{
    selector: string;
    eventName: string;
    handler: (this: T, e: Event) => void;
  }>;
  render(this: T): string | TemplateResult;
  onMount?(this: T): void;
  onUpdate?(this: T, changedProps: string[]): void;
  onUnmount?(this: T): void;
}

/**
 * Factory function to define and register an EXBA component.
 * Provides an alternative to using decorators for component registration and configuration.
 */
export function defineExbaComponent<T extends ExbaComponent>(def: ComponentDefinition<T>) {
  class Component extends ExbaComponent {
    static props = def.props || {};
    static styles = def.styles || {};
    static useShadow = def.useShadow ?? true;

    constructor() {
      super();
      if (def.state) {
        const initialState = typeof def.state === 'function' 
          ? def.state() 
          : def.state;
        this.setState(initialState);
      }
    }

    render() {
      return def.render.call(this);
    }

    onMount() {
      if (def.onMount) def.onMount.call(this);
    }

    onUpdate(changedProps: string[]) {
      if (def.onUpdate) def.onUpdate.call(this, changedProps);
    }

    onUnmount() {
      if (def.onUnmount) def.onUnmount.call(this);
    }

    override async safeUpdate() {
      await super.safeUpdate();
      if (def.listeners) {
        const root = this.shadowRoot || this;
        for (const { selector, eventName, handler } of def.listeners) {
          const elements = root.querySelectorAll(selector);
          elements.forEach(el => {
            if (!(el as any).__boundListeners) {
              (el as any).__boundListeners = new Map();
            }
            const boundKey = `${eventName}_${handler.toString()}`;
            if ((el as any).__boundListeners.has(boundKey)) {
              el.removeEventListener(eventName, (el as any).__boundListeners.get(boundKey));
            }
            const boundHandler = (e: Event) => handler.call(this, e);
            el.addEventListener(eventName, boundHandler);
            (el as any).__boundListeners.set(boundKey, boundHandler);
          });
        }
      }
    }
  }

  if (def.methods) {
    for (const [name, fn] of Object.entries(def.methods)) {
      (Component.prototype as any)[name] = fn;
    }
  }

  EXBA.register(def.tagName, Component);
  return Component;
}
