import { createReactiveState } from './ReactiveState';

export abstract class BaseComponent extends HTMLElement {
  protected shadow: ShadowRoot;
  protected _state: any;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  /**
   * Initialize component state. 
   * The provided state object will be made reactive.
   */
  protected setState(initialState: object) {
    this._state = createReactiveState(initialState, () => this.update());
    return this._state;
  }

  connectedCallback() {
    this.render();
  }

  /**
   * Components should return a template string of their HTML.
   */
  abstract render(): string;

  protected update() {
    // Optimization: only update if the HTML actually changed
    const newHtml = this.render();
    if (this.shadow.innerHTML !== newHtml) {
      this.shadow.innerHTML = newHtml;
    }
  }

  // Overriding the default render to handle the template string
  override connectedCallback() {
    const html = this.render();
    this.shadow.innerHTML = html;
  }
}
