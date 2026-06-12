/**
 * Context API for EXBA Framework
 * Allows sharing state across the component tree without prop-drilling.
 */

/** A unique key identifying a context. */
export type ContextKey = string;

/** The structure of data held within a context. */
export interface ContextValue {
  [key: string]: unknown;
}

const providers = new Map<ContextKey, WeakMap<HTMLElement, unknown>>();

/**
 * Register a provider for a specific key on a DOM element.
 * @param element The provider element.
 * @param key Unique context key.
 * @param value The data to share.
 */
export function provideContext<T>(
  element: HTMLElement,
  key: ContextKey,
  value: T,
): void {
  if (!providers.has(key)) {
    providers.set(key, new WeakMap());
  }
  providers.get(key)!.set(element, value);
}

/**
 * Consume a value for a specific key by traversing up the DOM tree from the consumer.
 * @param element The consumer element.
 * @param key The context key to look for.
 * @returns The shared value if found, otherwise undefined.
 */
export function consumeContext<T>(
  element: HTMLElement,
  key: ContextKey,
): T | undefined {
  let current: HTMLElement | null = element;
  while (current) {
    const providerMap = providers.get(key);
    if (providerMap && providerMap.has(current)) {
      return providerMap.get(current) as T;
    }
    current = current.parentElement;
  }
  return undefined;
}

/**
 * A declarative component wrapper that provides a context value to its children.
 * Usage: <exba-context-provider key="theme" value='{"color":"red"}'>...</exba-context-provider>
 */
export class ContextProvider extends HTMLElement {
  /** Property definitions (legacy style). */
  static props = {
    value: { type: Object, default: {} },
    key: { type: String, required: true },
  };

  /** Initializes the context provider. */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /**
   * Reads attributes and registers the element as a context provider.
   */
  connectedCallback() {
    const key = this.getAttribute('key') || 'default';
    const valAttr = this.getAttribute('value');
    let value = {};
    try {
      value = valAttr ? JSON.parse(valAttr) : {};
    } catch (e) {
      console.error('[EXBA] ContextProvider failed to parse value:', e);
    }
    
    (this as any).value = value;
    this.setAttribute('data-exba-ctx', key);
    provideContext(this, key, value);

    // Render slot for children
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '<slot></slot>';
    }
  }
}

customElements.define('exba-context-provider', ContextProvider);

/**
 * Legacy Context API object for backwards compatibility.
 */
export const Context = {
  provide: provideContext,
  consume: consumeContext,
};
