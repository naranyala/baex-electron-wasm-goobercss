import { createSignal } from '../reactivity/Reactivity';
import { BaseComponent } from './BaseComponent';
import { ComponentDefinition } from '../bridge/types';

export function defineComponent<S extends object>(config: ComponentDefinition & { initialState: S }) {
  const { name, initialState, render, mounted, events } = config;

  customElements.define(name!, class extends BaseComponent {
    private stateSignal = createSignal(initialState);
    private _eventsAttached = false;

    get state(): S {
      return this.stateSignal.get();
    }

    setState(updateFn: (s: S) => Partial<S>): void {
      const current = this.stateSignal.peek();
      const patch = updateFn(current);
      this.stateSignal.set({ ...current, ...patch });
    }

    constructor() {
      super(config);
    }

    render() {
      return render!(this.state, {
        setState: this.setState.bind(this),
      });
    }

    connectedCallback() {
      super.connectedCallback();
      this.wireEvents();
      if (mounted) {
        mounted(this as any, this.state);
      }
    }

    private wireEvents() {
      if (this._eventsAttached || !events) return;
      this._eventsAttached = true;
      Object.entries(events).forEach(([descriptor, handler]) => {
        const idx = descriptor.indexOf(' ');
        const eventType = descriptor.slice(0, idx);
        const selector = descriptor.slice(idx + 1).trim();
        this.shadow.addEventListener(eventType, (e: Event) => {
          const target = (e.target as HTMLElement).closest(selector);
          if (target && this.shadow.contains(target)) {
            handler(e, {
              state: this.state,
              setState: this.setState.bind(this),
            });
          }
        });
      });
    }
  });

  return config;
}
