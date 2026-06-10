type Listener = () => void;

export const effectDependencies = new Map<Listener, Set<SignalInternal<any>>>();

/**
 * Debugging API: Returns the total number of active effects in the system.
 */
export function getEffectCount(): number {
  return effectDependencies.size;
}

/**
 * Debugging API: Returns the signals that a specific effect is currently subscribed to.
 */
export function getEffectDeps(effect: Listener): SignalInternal<any>[] {
  const deps = effectDependencies.get(effect);
  return deps ? Array.from(deps) : [];
}

export interface Signal<T> {
  get: () => T;
  set: (val: T) => void;
  peek: () => T;
}

class SignalInternal<T> {
  private _value: T;
  private subscribers = new Set<Listener>();

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    const currentEffect = globalThis.__currentEffect as Listener | null;
    if (currentEffect) {
      this.subscribers.add(currentEffect);
      if (!effectDependencies.has(currentEffect)) {
        effectDependencies.set(currentEffect, new Set());
      }
      effectDependencies.get(currentEffect)!.add(this);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (this._value === newValue) return;
    this._value = newValue;
    this.subscribers.forEach(sub => sub());
  }

  removeEffect(effect: Listener) {
    this.subscribers.delete(effect);
  }
}

export function createSignal<T>(initialValue: T): Signal<T> {
  const signal = new SignalInternal(initialValue);
  return {
    get: () => signal.value,
    set: (val: T) => { signal.value = val; },
    peek: () => signal.value,
  };
}

export function createEffect(fn: () => void, scheduler?: (run: () => void) => void): () => void {
  const cleanup = () => {
    const deps = effectDependencies.get(effect);
    if (deps) {
      deps.forEach(signal => signal.removeEffect(effect));
      deps.clear();
    }
  };

  const effect = () => {
    if (scheduler) {
      scheduler(run);
    } else {
      run();
    }
  };

  const run = () => {
    cleanup();
    const prevEffect = globalThis.__currentEffect;
    globalThis.__currentEffect = effect;
    try {
      fn();
    } finally {
      globalThis.__currentEffect = prevEffect;
    }
  };

  run(); // Initial run is always sync to collect deps
  return () => {
    cleanup();
    effectDependencies.delete(effect);
  };
}

export function createDerived<T, U>(signal: Signal<T>, transform: (val: T) => U): { get: () => U } {
  return {
    get: () => transform(signal.get()),
  };
}

/**
 * Creates a reactive proxy store for an object.
 * Each property is automatically backed by a signal.
 */
export function createStore<T extends object>(initialValue: T): T {
  const signals = new Map<string | symbol, Signal<any>>();
  
  return new Proxy(initialValue, {
    get(target, prop) {
      if (!signals.has(prop)) {
        signals.set(prop, createSignal((target as any)[prop]));
      }
      return signals.get(prop)!.get();
    },
    set(target, prop, value) {
      if (!signals.has(prop)) {
        signals.set(prop, createSignal(value));
      }
      (target as any)[prop] = value;
      signals.get(prop)!.set(value);
      return true;
    }
  });
}

export function bindSignal<T>(element: HTMLElement | null, signal: Signal<T>, property: 'textContent' | 'value' | 'className' = 'textContent') {
  if (!element) return;
  createEffect(() => {
    const value = signal.get();
    (element as any)[property] = value;
  });
}

declare global {
  var __currentEffect: (() => void) | null;
}
