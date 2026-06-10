import { createEffect } from '../reactivity/Reactivity';
import { ComponentDefinition, TemplateNode } from '../bridge/types';
import { bindText, bindAttr, bindClass } from './Primitives';
import { stringifyValue, eventHandlers } from './Templates';

interface UIBlueprint {
  tier: 1 | 2 | 3;
  base_html: string;
  dynamic_slots: number[];
  events: Array<{ event_type: string; handler_id: string }>;
}

export abstract class BaseComponent extends HTMLElement {
  public shadow: HTMLElement | ShadowRoot;
  protected definition: ComponentDefinition<any>;
  private _effectCleanup: (() => void) | null = null;
  public _cleanups: (() => void)[] = [];
  protected _eventsAttached = false;
  private _bindingCleanups: (() => void)[] = [];
  protected _props: Record<string, any> = {};
  private _providedContext: Map<string, any> = new Map();
  private _updateQueued = false;
  protected _firstRender = true;
  
  // Tiered Rendering Cache
  private _blueprint: UIBlueprint | null = null;
  private _dynamicElements = new Map<number, HTMLElement>();
  private _activeTier: 1 | 2 | 3 = 3;

  constructor(definition?: ComponentDefinition<any>) {
    super();
    this.definition = definition || { autoUpdate: true } as any;
    if (this.definition.useShadow !== false) {
      this.shadow = this.attachShadow({ mode: 'open' }) as any;
    } else {
      this.shadow = this as any;
    }
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
    if (this.definition.useShadow !== false) {
      this.applyStyles();
    }

    if (this.definition.autoUpdate !== false) {
      this._effectCleanup = createEffect(
        () => this.update(), 
        (run) => {
          if (this._updateQueued) return;
          this._updateQueued = true;
          requestAnimationFrame(() => {
            this._updateQueued = false;
            if (this.isConnected) run();
          });
        }
      );
    } else {
      this.update();
    }

    if (this.definition.mounted) {
      this.definition.mounted(this, (this as any).state, this.props);
    }
  }

  private applyStyles() {
    if (this.definition.styles) {
      const styleTag = document.createElement('style');
      styleTag.textContent = this.definition.styles;
      this.shadow.appendChild(styleTag);
    }
    this.optimizeStyles();
  }

  disconnectedCallback() {
    if (this._effectCleanup) {
      this._effectCleanup();
      this._effectCleanup = null;
    }
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
    this._bindingCleanups.forEach(fn => fn());
    this._bindingCleanups = [];
    if (this.definition.unmounted) {
      this.definition.unmounted(this);
    }
  }

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
          if (this.definition.useShadow !== false) {
            this.optimizeStyles();
          }
          this.applyBindings();
          this.wireTemplateEvents();
          if (!this._firstRender && this.definition.updated) {
            this.definition.updated(this, (this as any).state, this.props);
          }
        }
      } else {
        this.renderTemplate(content);
        this.wireTemplateEvents();
        if (!this._firstRender && this.definition.updated) {
          this.definition.updated(this, (this as any).state, this.props);
        }
      }
      
      this._firstRender = false;
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

  private async tryOptimizeTemplate(nodes: TemplateNode[]) {
    if ((window as any).EXBA_DISABLE_WASM_OPTIMIZATION) {
      this.escalateToTier2(nodes);
      return;
    }

    const rawHtml = nodes.map((node, idx) => {
      if (node.type === 'static') return node.content;
      return `<span data-dyn-id="${idx}"></span>`;
    }).join('');

    if (this._blueprint && this._blueprint.base_html === rawHtml) return;

    try {
      const { WasmBridge } = await import('../bridge/WasmBridge');
      const result = await WasmBridge.system.execute('OptimizeUI', { template: rawHtml });
      const blueprint: UIBlueprint = JSON.parse(result);
      
      const dynamicElements = new Map<number, HTMLElement>();
      blueprint.dynamic_slots.forEach(id => {
        const el = this.shadow.querySelector(`[data-dyn-id="${id}"]`) as HTMLElement;
        if (el) dynamicElements.set(id, el);
      });

      this._blueprint = blueprint;
      this._dynamicElements = dynamicElements;
      this._activeTier = 1;
      return;
    } catch (e) {
      this.escalateToTier2(nodes);
    }
  }

  private escalateToTier2(nodes: TemplateNode[]) {
    try {
      const rawHtml = nodes.map((node, idx) => {
        if (node.type === 'static') return node.content;
        return `<span data-dyn-id="${idx}"></span>`;
      }).join('');

      const dynamic_slots: number[] = [];
      const dynamicElements = new Map<number, HTMLElement>();
      
      const elements = this.shadow.querySelectorAll<HTMLElement>('[data-dyn-id]');
      elements.forEach(el => {
        const id = parseInt(el.getAttribute('data-dyn-id') || '', 10);
        if (!isNaN(id)) {
          dynamic_slots.push(id);
          dynamicElements.set(id, el);
        }
      });

      this._blueprint = {
        tier: 2,
        base_html: rawHtml,
        dynamic_slots,
        events: []
      };
      this._dynamicElements = dynamicElements;
      this._activeTier = 2;
    } catch (e) {
      this._activeTier = 3;
    }
  }

  private renderTemplate(nodes: TemplateNode[]) {
    const state = (this as any).state;
    
    const baseHtml = nodes.map((node, idx) => {
      if (node.type === 'static') return node.content;
      return `<span data-dyn-id="${idx}"></span>`;
    }).join('');

    if (this.shadow.innerHTML === '' || this._firstRender) {
      this.shadow.innerHTML = baseHtml;
      if (this.definition.useShadow !== false) {
        this.optimizeStyles();
      }
      this.wireTemplateEvents();
      this.tryOptimizeTemplate(nodes);
    }

    if (this._activeTier < 3 && this._blueprint) {
      nodes.forEach((node, idx) => {
        if (node.type === 'dynamic') {
          const el = this._dynamicElements.get(idx);
          if (el) {
            const stringValue = stringifyValue(node.content(state), state);
            if (el.innerHTML !== stringValue) el.innerHTML = stringValue;
          }
        }
      });
    } else {
      nodes.forEach((node, idx) => {
        if (node.type === 'dynamic') {
          const el = this.shadow.querySelector(`[data-dyn-id="${idx}"]`);
          if (el) {
            const stringValue = stringifyValue(node.content(state), state);
            if (el.innerHTML !== stringValue) el.innerHTML = stringValue;
          }
        }
      });
    }
    
    this.applyBindings();
  }

  private wireTemplateEvents() {
    const all = this.shadow.querySelectorAll<HTMLElement>('*');
    all.forEach(el => {
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith('data-exba-evt-')) {
          const eventName = attr.name.replace('data-exba-evt-', '');
          const handlerId = attr.value;
          const handler = eventHandlers.get(handlerId);
          if (handler) {
            el.addEventListener(eventName, handler);
            this._cleanups.push(() => el.removeEventListener(eventName, handler));
          }
        }
      }
    });
  }

  private applyBindings() {
    const bindings = this.definition.bindings;
    if (!bindings) return;

    this._bindingCleanups.forEach(fn => fn());
    this._bindingCleanups = [];

    const state = (this as any).state;

    if (bindings.text) {
      for (const [selector, valueFn] of Object.entries(bindings.text)) {
        const el = this.shadow.querySelector(selector) as HTMLElement | null;
        if (el) {
          const effect = createEffect(() => {
            bindText(el, { get: () => valueFn(state), peek: () => valueFn(state) } as any);
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
        (this.shadow as any).adoptedStyleSheets = [sheet];
        inlineStyle.remove();
      } catch {
      }
    }
  }

  bind(fn: (el: HTMLElement, props: Record<string, any>) => void): void {
    fn(this.shadow as any, this.props);
  }

  provide(key: string, value: any) {
    this._providedContext.set(key, value);
  }

  inject<T = any>(key: string): T | undefined {
    if (this._providedContext.has(key)) {
      return this._providedContext.get(key);
    }
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
