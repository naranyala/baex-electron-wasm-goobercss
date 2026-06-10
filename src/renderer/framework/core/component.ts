import { Context } from './context';
import { patch, type TemplateResult } from './dom';
import { EXBA } from './exba';

export interface ComponentState {
  [key: string]: any;
}

export interface ComponentProps {
  [key: string]: 'string' | 'number' | 'boolean' | 'json';
}

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

  constructor() {
    super();
    if ((this.constructor as typeof ExbaComponent).useShadow) {
      this.attachShadow({ mode: 'open' });
    }
  }

  static get observedAttributes() {
    return Object.keys((this as any).props || {});
  }

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
   * The core rendering method. Should return a string of HTML or a TemplateResult.
   */
  abstract render(): string | TemplateResult;

  /**
   * Lifecycle hooks
   */
  protected onMount(): void {}
  protected onUpdate(_changedProps: string[]): void {}
  protected onUnmount(): void {}

  connectedCallback() {
    this.safeUpdate();
    this.onMount();
  }

  disconnectedCallback() {
    this.onUnmount();
    this.cleanup();
  }

  private cleanup() {
    this.activeSubscriptions.forEach((unsub) => unsub());
    this.activeSubscriptions = [];
  }

  /**
   * Updates the component state and triggers a re-render.
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
   */
  protected createEffect(key: string, callback: (val: any) => void) {
    const unsub = EXBA.subscribe(key, (val) => {
        callback(val);
    });
    this.activeSubscriptions.push(unsub);
    return unsub;
  }

  /**
   * Emits a custom event from the component.
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
   * Context API: Access values from a Provider higher up the tree.
   */
  protected useContext<T>(contextId: string): T | null {
    return Context.consume<T>(this as any, contextId) || null;
  }

  protected getSlotContent(name: string = 'default'): string {
    const root = this.shadowRoot || this;
    const slot = root.querySelector(`slot[name="${name}"]`);
    return (slot as any)?.innerHTML || '';
  }

  private async safeUpdate() {
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

  protected subscribeToState(key: string) {
    const unsub = EXBA.subscribe(key, (val) => {
      this.setState({ [key]: val });
    });
    this.activeSubscriptions.push(unsub);
  }

  protected async callWasm<T>(method: string, ...args: any[]): Promise<T> {
    return EXBA.callBridge<T>(method, ...args);
  }

  // ─── Functional Hooks ──────────────────────────────────────
  
  /**
   * Creates a reactive signal that is scoped to this component's lifecycle.
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
