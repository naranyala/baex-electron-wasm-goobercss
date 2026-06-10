import { createStore } from '../reactivity/Reactivity';
import { BaseComponent } from './BaseComponent';
import { ComponentDefinition, EventContext } from '../bridge/types';

export function defineComponent<S extends object>(config: ComponentDefinition<S>): ComponentDefinition<S> {
  const { initialState, render, setup, events } = config;

  const ComponentClass = class extends BaseComponent {
    public state: S;

    constructor() {
      super(config);
      // Ensure each instance has its own state clone
      this.state = createStore(JSON.parse(JSON.stringify(initialState)));
    }

    setState(updateFn: (s: S) => Partial<S>): void {
      const updates = updateFn(this.state);
      Object.assign(this.state as any, updates);
    }

    render() {
      const context: EventContext<S> = {
        state: this.state,
        setState: this.setState.bind(this),
        target: this,
        onUnmount: (fn: () => void) => {
          this._cleanups.push(fn);
        }
      };
      return render!(this.state, this.props, context);
    }

    connectedCallback() {
      super.connectedCallback();
      
      if (setup) {
        setup({
          state: this.state,
          setState: this.setState.bind(this),
          target: this,
          onUnmount: (fn: () => void) => {
            this._cleanups.push(fn);
          }
        });
      }

      if (events) {
        Object.entries(events).forEach(([descriptor, handler]) => {
          const idx = descriptor.indexOf(' ');
          const eventType = descriptor.slice(0, idx);
          const selector = descriptor.slice(idx + 1).trim();
          this.shadow.addEventListener(eventType, (e: Event) => {
            const path = e.composedPath();
            const target = (path[0] as HTMLElement).closest(selector) as HTMLElement;
            if (target && this.shadow.contains(target)) {
              handler(e, {
                state: this.state,
                setState: this.setState.bind(this),
                target,
                onUnmount: (fn: () => void) => {
                  this._cleanups.push(fn);
                }
              });
            }
          });
        });
      }
    }
  };

  if (!customElements.get(config.name!)) {
    customElements.define(config.name!, ComponentClass);
  }

  return config;
}
