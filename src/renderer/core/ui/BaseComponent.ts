import { createEffect } from '../reactivity/Reactivity';
import { ComponentDefinition } from '../bridge/types';

export abstract class BaseComponent extends HTMLElement {
  protected shadow: ShadowRoot;
  protected _state: any;
  protected definition: ComponentDefinition;

  constructor(definition?: ComponentDefinition) {
    super();
    this.definition = definition || { autoUpdate: true };
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.definition.autoUpdate !== false) {
      createEffect(() => {
        this.update();
      });
    } else {
      this.update();
    }
  }

  /**
   * Components should return a template string of their HTML.
   */
  abstract render(): string;

  protected update() {
    const newHtml = this.render();
    if (this.shadow.innerHTML !== newHtml) {
      this.shadow.innerHTML = newHtml;
    }
  }
}
