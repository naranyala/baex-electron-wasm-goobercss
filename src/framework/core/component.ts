import { Context } from './context';
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
  }

  /**
   * Returns an array of attribute names to monitor for changes.
   * Derived from the static `props` definition.
   */
  static get observedAttributes() {
    return Object.keys((this as any).props || {});
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

    const propType = (this.constructor as typeof ExbaComponent).props[name];
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

    this.setState({ [name]: value });
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
   * Merges new data into the component state and schedules an update.
   * @param newState Partial state object to merge.
   */
  setState(newState: Partial<ComponentState>) {
    const changed: string[] = [];
    for (const key in newState) {
      if (this.state[key] !== newState[key]) {
        changed.push(key);
      }
    }
    
    if (changed.length === 0) return;

    this.state = { ...this.state, ...newState };
    this.safeUpdate();
    this.onUpdate(changed);
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
   * Accesses a shared context provider higher up in the DOM tree.
   * @param contextId Unique ID of the context to consume.
   */
  protected useContext<T>(contextId: string): T | null {
    return Context.consume<T>(this as any, contextId) || null;
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
   * Performs a patched DOM update by executing `render()` and applying changes.
   * Handles scoped style injection and error boundaries.
   */
  protected async safeUpdate() {
    const root = this.shadowRoot || this;
    if (!root) return;

    try {
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
        await patch(root as any, fullHTML);
      } else {
        // If it's a TemplateResult, we prepend the style tag to the first string segment
        const res = htmlOutput as any;
        const newStrings = [...res.strings];
        newStrings[0] = styleTag + newStrings[0];
        await patch(root as any, { ...res, strings: newStrings });
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
    }
  }

  /**
   * Convenience method to link a global EXBA signal directly to a local state property.
   * @param key The global signal key.
   */
  protected subscribeToState(key: string) {
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

  // ─── Functional Hooks ──────────────────────────────────────
  
  /**
   * Creates a reactive signal that is scoped to this component's lifecycle.
   * Automatically triggers a re-render when the signal value changes.
   * @param initialValue Starting value.
   * @param key Optional unique key.
   */
  protected useSignal<T>(initialValue: T, key?: string) {
    const signal = EXBA.createSignal(initialValue, key);
    this.createEffect(signal.key, (_val) => {
        // Force update when signal changes if it's not already handled by local state
        this.safeUpdate();
    });
    return signal;
  }
}
