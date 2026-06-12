import { EXBA } from './exba';

/**
 * Decorator to register an EXBA component with a custom element tag name.
 */
export function customElement(tagName: string) {
  return function (constructor: any) {
    EXBA.register(tagName, constructor);
  };
}

/**
 * Decorator to define a reactive property that is synced with an HTML attribute.
 */
export function property(type: 'string' | 'number' | 'boolean' | 'json' = 'string') {
  return function (target: any, propertyKey: string) {
    const constructor = target.constructor;
    if (!constructor.props) {
      constructor.props = {};
    }
    constructor.props[propertyKey] = type;

    // Define getter/setter on prototype to link to this.state
    Object.defineProperty(target, propertyKey, {
      get() {
        return this.state[propertyKey];
      },
      set(value: any) {
        this.setState({ [propertyKey]: value });
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Decorator to define a reactive local state property.
 */
export function state() {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return this.state[propertyKey];
      },
      set(value: any) {
        this.setState({ [propertyKey]: value });
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Decorator to link a component property to a global WASM AppState key.
 */
export function wasmState(wasmKey: string) {
  return function (target: any, propertyKey: string) {
    const originalOnMount = target.onMount;
    target.onMount = function() {
      this.subscribeToState(wasmKey);
      if (originalOnMount) originalOnMount.apply(this);
    };

    Object.defineProperty(target, propertyKey, {
      get() {
        return this.state[wasmKey];
      },
      set(value: any) {
        if (EXBA.state && EXBA.state.value) {
          EXBA.state.value[wasmKey] = value;
        }
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Decorator to mark a method or property as a WASM bridge call.
 */
export function wasmCall() {
  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    const callFn = async function(this: any, ...args: any[]) {
        return EXBA.callBridge(propertyKey, ...args);
    };

    if (descriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        const result = await originalMethod.apply(this, args);
        const payload = result === undefined ? args : (Array.isArray(result) ? result : [result]);
        return EXBA.callBridge(propertyKey, ...payload);
      };
      return descriptor;
    } else {
      // Property style decorator
      Object.defineProperty(target, propertyKey, {
        value: callFn,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  };
}

/**
 * Decorator to mark a method or property as a WASM bridge command (fire and forget).
 * @param commandName Optional explicit name for the command.
 */
export function wasmCommand(commandName?: string) {
  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    const method = commandName || propertyKey;
    const commandFn = function(this: any, ...args: any[]) {
        return EXBA.callBridge(method, ...args);
    };

    if (descriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        const result = originalMethod.apply(this, args);
        const payload = result === undefined ? args : (Array.isArray(result) ? result : [result]);
        return EXBA.callBridge(method, ...payload);
      };
      return descriptor;
    } else {
      // Property style decorator
      Object.defineProperty(target, propertyKey, {
        value: commandFn,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  };
}

/**
 * Decorator to bind an event listener to a specific element within the component.
 */
export function eventListener(selector: string, eventName: string) {
  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    const originalOnMount = target.onMount;
    target.onMount = function() {
      const root = this.shadowRoot || this;
      const el = root.querySelector(selector);
      if (el && descriptor && descriptor.value) {
        el.addEventListener(eventName, descriptor.value.bind(this));
      }
      if (originalOnMount) originalOnMount.apply(this);
    };
  };
}
