type Listener = () => void;

class SignalInternal<T> {
  private _value: T;
  private subscribers = new Set<Listener>();

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    // Track dependency
    const currentEffect = globalThis.__currentEffect as Listener | null;
    if (currentEffect) {
      this.subscribers.add(currentEffect);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (this._value === newValue) return;
    this._value = newValue;
    // Notify all subscribers
    this.subscribers.forEach(sub => sub());
  }
}

export function createSignal<T>(initialValue: T): { 
  get: () => T; 
  set: (val: T) => void; 
  peek: () => T;
} {
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
    // Cleanup would go here if we had a more complex dependency tracker
  };
}

export function createDerived<T, U>(signal: { get: () => T }, transform: (val: T) => U): { get: () => U } {
  return {
    get: () => transform(signal.get()),
  };
}

export function bindSignal<T>(element: HTMLElement | null, signal: { get: () => T }, property: 'textContent' | 'value' | 'className' = 'textContent') {
  if (!element) return;
  createEffect(() => {
    const value = signal.get();
    (element as any)[property] = value;
  });
}

// Extend globalThis for dependency tracking
declare global {
  var __currentEffect: (() => void) | null;
}
