import { createReactiveState } from './ReactiveState';

interface ComponentConfig<S extends object> {
  name: string;
  initialState: S;
  render: (state: S, helpers: { setState: (update: (s: S) => S) => void }) => string;
  mounted?: (el: HTMLElement, state: S) => void;
}

export function defineComponent<S extends object>({ name, initialState, render, mounted }: ComponentConfig<S>) {
  customElements.define(name, class extends HTMLElement {
    private state: S;
    private shadow: ShadowRoot;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      
      // Create reactive state that triggers this.update()
      this.state = createReactiveState(initialState, () => this.update());
    }

    connectedCallback() {
      this.update();
      if (mounted) {
        mounted(this, this.state);
      }
    }

    update() {
      const helpers = {
        setState: (updateFn: (s: S) => S) => {
          const newState = updateFn(this.state);
          Object.assign(this.state, newState);
        }
      };
      
      const html = render(this.state, helpers);
      if (this.shadow.innerHTML !== html) {
        this.shadow.innerHTML = html;
        if (mounted) {
          mounted(this, this.state);
        }
      }
    }
  });
}
