import { createReactiveState } from '../reactivity/ReactiveState';
import { BaseComponent } from './BaseComponent';
import { ComponentDefinition } from '../bridge/types';

/**
 * Factory function to create a reactive custom element.
 * It binds the component's state to a reactive proxy that triggers a re-render on change.
 * 
 * @template S - The shape of the component's state.
 * @param {ComponentDefinition & { initialState: S }} config - The component definition including initial state and render function.
 * @returns {ComponentDefinition} The original config for further use.
 */
export function defineComponent<S extends object>(config: ComponentDefinition & { initialState: S }) {
  const { name, initialState, render, mounted } = config;

  customElements.define(name!, class extends BaseComponent {
    /** The reactive state of the component. */
    public state: S;

    constructor() {
      super(config);
      // Use the reactive state to trigger the parent's update()
      this.state = createReactiveState(initialState, () => this.update());
      this._state = this.state;
    }

    /**
     * Renders the component using the provided render function.
     * provides 'setState' helper to allow children to trigger updates.
     */
    render() {
      const helpers = {
        /**
         * Updates the component state.
         * @param {Function} updateFn - A function that takes the current state and returns the new state.
         */
        setState: (updateFn: (s: S) => S) => {
          const newState = updateFn(this.state);
          Object.assign(this.state, newState);
        }
      };
      return render!(this.state, helpers);
    }

    /** Lifecycle hook: called when the element is added to the DOM. */
    connectedCallback() {
      super.connectedCallback();
      if (mounted) {
        mounted(this as any, this.state);
      }
    }
  });

  return config;
}
