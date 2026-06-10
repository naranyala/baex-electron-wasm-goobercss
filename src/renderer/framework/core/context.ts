/**
 * Context API for EXBA Framework
 * Allows sharing state across the component tree without prop-drilling.
 */

export type ContextKey = string;

export interface ContextValue {
  [key: string]: unknown;
}

const providers = new Map<ContextKey, WeakMap<HTMLElement, unknown>>();

/**
 * Register a provider for a specific key.
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
 * Consume a value for a specific key by traversing up the DOM tree.
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
 * A component wrapper that provides a context value to its children.
 */
export class ContextProvider extends HTMLElement {
  static props = {
    value: { type: Object, default: {} },
    key: { type: String, required: true },
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const key = this.getAttribute('key') || 'default';
    const value = JSON.parse(this.getAttribute('value') || '{}');
    provideContext(this, key, value);

    // Render slot for children
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '<slot></slot>';
    }
  }
}

customElements.define('exba-context-provider', ContextProvider);

// Legacy export for compatibility
export const Context = {
  provide: provideContext,
  consume: consumeContext,
};
