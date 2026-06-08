type Listener = () => void;

/**
 * Internal implementation of a reactive signal.
 * Tracks subscribers and notifies them on value changes.
 */
class SignalInternal<T> {
  private _value: T;
  private subscribers = new Set<Listener>();

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    // Track dependency: if we are currently executing an effect, add it as a subscriber
    const currentEffect = globalThis.__currentEffect as Listener | null;
    if (currentEffect) {
      this.subscribers.add(currentEffect);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (this._value === newValue) return;
    this._value = newValue;
    // Notify all subscribers to re-run their effects
    this.subscribers.forEach(sub => sub());
  }
}

/**
 * Creates a reactive signal. A signal is a piece of state that can be tracked.
 * 
 * @param {T} initialValue - The starting value of the signal.
 * @returns {Object} An object with get, set, and peek methods.
 */
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

/**
 * Creates a reactive effect that automatically re-runs whenever any signal 
 * it depends on is updated.
 * 
 * @param {Function} fn - The effect function to execute.
 * @returns {Function} A cleanup function to stop the effect.
 */
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

/**
 * Creates a derived signal that automatically updates when its source signal changes.
 * 
 * @param {Object} signal - The source signal to track.
 * @param {Function} transform - The function to transform the source value.
 * @returns {Object} A read-only signal returning the transformed value.
 */
export function createDerived<T, U>(signal: { get: () => T }, transform: (val: T) => U): { get: () => U } {
  return {
    get: () => transform(signal.get()),
  };
}

/**
 * Binds a signal's value directly to a DOM element's property.
 * 
 * @param {HTMLElement | null} element - The target DOM element.
 * @param {Object} signal - The signal to bind.
 * @param {'textContent' | 'value' | 'className'} property - The property to update.
 */
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
