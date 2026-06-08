import { createReactiveState } from '../reactivity/ReactiveState';
import { BaseComponent } from './BaseComponent';
import { ComponentDefinition } from '../bridge/types';

export function defineComponent<S extends object>(config: ComponentDefinition & { initialState: S }) {
  const { name, initialState, render, mounted } = config;

  customElements.define(name!, class extends BaseComponent {
    public state: S;

    constructor() {
      super(config);
      // Use the reactive state to trigger the parent's update()
      this.state = createReactiveState(initialState, () => this.update());
      this._state = this.state;
    }

    render() {
      const helpers = {
        setState: (updateFn: (s: S) => S) => {
          const newState = updateFn(this.state);
          Object.assign(this.state, newState);
        }
      };
      return render!(this.state, helpers);
    }

    connectedCallback() {
      super.connectedCallback();
      if (mounted) {
        mounted(this as any, this.state);
      }
    }
  });

  return config;
}
