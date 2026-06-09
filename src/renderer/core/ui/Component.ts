import { createSignal } from '../reactivity/Reactivity';
import { BaseComponent } from './BaseComponent';
import { ComponentDefinition, EventContext } from '../bridge/types';
import { ComponentValidator } from './ComponentValidator';

export function defineComponent<S extends object>(config: ComponentDefinition<S>) {
  ComponentValidator.validate(config);
  const { name, initialState, render, mounted, events, observedAttributes = [] } = config;

  const ComponentClass = class extends BaseComponent {
    private stateSignal = createSignal(initialState);

    get state(): S {
      return this.stateSignal.get();
    }

    setState(updateFn: (s: S) => Partial<S>): void {
      const current = this.stateSignal.peek();
      const patch = updateFn(current);
      this.stateSignal.set({ ...current, ...patch });
    }

    static get observedAttributes() {
      return observedAttributes;
    }

    render() {
      const context: EventContext<S> = {
        state: this.state,
        setState: this.setState.bind(this),
      };
      return render!(this.state, this.props, context);
    }

    connectedCallback() {
      super.connectedCallback();
      this.wireEvents();
    }

    private wireEvents() {
      if (this._eventsAttached || !events) return;
      this._eventsAttached = true;
      Object.entries(events).forEach(([descriptor, handler]) => {
        const idx = descriptor.indexOf(' ');
        const eventType = descriptor.slice(0, idx);
        const selector = descriptor.slice(idx + 1).trim();
        this.shadow.addEventListener(eventType, (e: Event) => {
          const path = e.composedPath();
          const target = (path[0] as HTMLElement).closest(selector);
          if (target && this.shadow.contains(target)) {
            handler(e, {
              state: this.state,
              setState: this.setState.bind(this),
            });
          }
        });
      });
    }
  };

  if (!customElements.get(name!)) {
    customElements.define(name!, ComponentClass);
  }

  return config;
}
