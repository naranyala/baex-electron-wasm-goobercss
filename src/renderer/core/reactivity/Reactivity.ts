type Listener = () => void;

const effectDependencies = new Map<Listener, Set<SignalInternal<any>>>();

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

export function createEffect(fn: () => void): () => void {
  const effect = () => {
    const prevEffect = globalThis.__currentEffect;
    globalThis.__currentEffect = effect;
    try {
      fn();
    } finally {
      globalThis.__currentEffect = prevEffect;
    }
  };

  effect();
  return () => {
    const deps = effectDependencies.get(effect);
    if (deps) {
      deps.forEach(signal => signal.removeEffect(effect));
      effectDependencies.delete(effect);
    }
  };
}

export function createDerived<T, U>(signal: Signal<T>, transform: (val: T) => U): { get: () => U } {
  return {
    get: () => transform(signal.get()),
  };
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
