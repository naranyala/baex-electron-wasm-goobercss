import { createEffect } from '../reactivity/Reactivity';
import { ComponentDefinition } from '../bridge/types';

export abstract class BaseComponent extends HTMLElement {
  protected shadow: ShadowRoot;
  protected definition: ComponentDefinition;
  private _effectCleanup: (() => void) | null = null;
  protected _cleanups: (() => void)[] = [];

  constructor(definition?: ComponentDefinition) {
    super();
    this.definition = definition || { autoUpdate: true };
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.definition.autoUpdate !== false) {
      this._effectCleanup = createEffect(() => {
        this.update();
      });
    } else {
      this.update();
    }
  }

  disconnectedCallback() {
    if (this._effectCleanup) {
      this._effectCleanup();
      this._effectCleanup = null;
    }
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
  }

  abstract render(): string;

  protected update() {
    const newHtml = this.render();
    if (this.shadow.innerHTML !== newHtml) {
      this.shadow.innerHTML = newHtml;
      this.optimizeStyles();
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
}
