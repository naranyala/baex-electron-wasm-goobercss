import { createEffect } from '../reactivity/Reactivity';
import { ComponentDefinition, ComponentBindings, TemplateNode } from '../bridge/types';
import { bindText, bindAttr, bindClass } from './Primitives';

export abstract class BaseComponent extends HTMLElement {
  public shadow: ShadowRoot;
  protected definition: ComponentDefinition<any>;
  private _effectCleanup: (() => void) | null = null;
  public _cleanups: (() => void)[] = [];
  protected _eventsAttached = false;
  private _bindingCleanups: (() => void)[] = [];
  protected _props: Record<string, any> = {};
  private _providedContext: Map<string, any> = new Map();

  constructor(definition?: ComponentDefinition<any>) {
    super();
    this.definition = definition || { autoUpdate: true } as any;
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  get props() {
    return this._props;
  }

  set props(value: Record<string, any>) {
    this._props = value;
    this.update();
  }

  static get observedAttributes(): string[] {
    return [];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue) {
      this._props[name] = newValue;
      this.update();
    }
  }

  connectedCallback() {
    if (this.definition.autoUpdate !== false) {
      this._effectCleanup = createEffect(() => {
        this.update();
      });
    } else {
      this.update();
    }

    if (this.definition.mounted) {
      this.definition.mounted(this, (this as any).state, this.props);
    }
  }

  disconnectedCallback() {
    if (this._effectCleanup) {
      this._effectCleanup();
      this._effectCleanup = null;
    }
    
    if (this.definition.unmounted) {
      this.definition.unmounted(this);
    }
    
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
    this._bindingCleanups.forEach(fn => fn());
    this._bindingCleanups = [];
  }

  /**
   * Retrieves the content of a specific slot.
   */
  getSlotContent(slotName: string): HTMLElement[] {
    const slot = this.shadow.querySelector(`slot[name="${slotName}"]`);
    if (!slot) return [];
    return Array.from((slot as any).assignedElements());
  }

  abstract render(): string | TemplateNode[];

  protected update() {
    try {
      const content = this.render();
      
      if (typeof content === 'string') {
        if (this.shadow.innerHTML !== content) {
          this.shadow.innerHTML = content;
          this.optimizeStyles();
          this.applyBindings();
          if (this.definition.updated) {
            this.definition.updated(this, (this as any).state, this.props);
          }
        }
      } else {
        this.renderTemplate(content);
      }
    } catch (error) {
      console.error(`Render error in ${this.tagName}:`, error);
      if (this.definition.errorRender) {
        const state = (this as any).state;
        this.shadow.innerHTML = this.definition.errorRender!(error as Error, state);
      } else {
        this.shadow.innerHTML = `<div style="color: red; padding: 1rem; border: 1px solid red;">
          <strong>Component Error:</strong> ${error instanceof Error ? error.message : String(error)}
        </div>`;
      }
    }
  }

  private renderTemplate(nodes: TemplateNode[]) {
    const state = (this as any).state;
    
    // Initial render if shadow is empty or we're forcing a full re-render
    if (this.shadow.innerHTML === '') {
      const html = nodes.map((node, idx) => {
        if (node.type === 'static') return node.content;
        return `<span data-dyn-id="${idx}"></span>`;
      }).join('');
      
      this.shadow.innerHTML = html;
      this.optimizeStyles();
    }

    // Surgical updates for dynamic nodes
    nodes.forEach((node, idx) => {
      if (node.type === 'dynamic') {
        const el = this.shadow.querySelector(`[data-dyn-id="${idx}"]`);
        if (el) {
          const currentValue = node.content(state);
          if (el.textContent !== currentValue) {
            el.textContent = currentValue;
          }
        }
      }
    });
    
    this.applyBindings();
  }

  private applyBindings() {
    const bindings = this.definition.bindings;
    if (!bindings) return;

    this._bindingCleanups.forEach(fn => fn());
    this._bindingCleanups = [];

    const state = (this as any).state;

    if (bindings.text) {
      for (const [selector, fn] of Object.entries(bindings.text)) {
        const el = this.shadow.querySelector(selector) as HTMLElement | null;
        if (el) {
          const effect = createEffect(() => {
            bindText(el, { get: () => fn(state), peek: () => fn(state) } as any);
          });
          this._bindingCleanups.push(effect);
        }
      }
    }

    if (bindings.attr) {
      for (const [selector, config] of Object.entries(bindings.attr)) {
        const el = this.shadow.querySelector(selector) as HTMLElement | null;
        if (el) {
          const effect = createEffect(() => {
            bindAttr(el, config.attr, { get: () => config.value(state), peek: () => config.value(state) } as any);
          });
          this._bindingCleanups.push(effect);
        }
      }
    }

    if (bindings.class) {
      for (const [selector, config] of Object.entries(bindings.class)) {
        const el = this.shadow.querySelector(selector) as HTMLElement | null;
        if (el) {
          const effect = createEffect(() => {
            bindClass(el, config.className, { get: () => config.value(state), peek: () => config.value(state) } as any);
          });
          this._bindingCleanups.push(effect);
        }
      }
    }
  }

  private optimizeStyles() {
    const inlineStyle = this.shadow.querySelector('style');
    if (inlineStyle) {
      try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(inlineStyle.textContent || '');
        this.shadow.adoptedStyleSheets = [sheet];
        inlineStyle.remove();
      } catch {
        // Fallback: keep inline <style> if CSSStyleSheet unsupported
      }
    }
  }

  // Registration helper for binding primitives
  bind(fn: (el: HTMLElement, props: Record<string, any>) => void): void {
    fn(this.shadow as any, this.props);
  }

  /**
   * Provides a value to all descendant components.
   */
  provide(key: string, value: any) {
    this._providedContext.set(key, value);
  }

  /**
   * Injects a value provided by an ancestor component.
   */
  inject<T = any>(key: string): T | undefined {
    // Check local provider first
    if (this._providedContext.has(key)) {
      return this._providedContext.get(key);
    }

    // Traverse up the DOM tree to find a provider
    let parent = this.parentElement;
    while (parent) {
      if (parent instanceof BaseComponent && parent._providedContext.has(key)) {
        return parent._providedContext.get(key);
      }
      parent = parent.parentElement;
    }

    return undefined;
  }
}
