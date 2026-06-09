export function pipe<T>(value: T): T;
export function pipe<T, A>(value: T, fn1: (v: T) => A): A;
export function pipe<T, A, B>(value: T, fn1: (v: T) => A, fn2: (v: A) => B): B;
export function pipe<T, A, B, C>(value: T, fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C): C;
export function pipe<T, A, B, C, D>(value: T, fn1: (v: T) => A, fn2: (v: A) => B, fn3: (v: B) => C, fn4: (v: C) => D): D;
export function pipe(value: unknown, ...fns: ((v: unknown) => unknown)[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}

export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

export function curry<T extends (...args: any[]) => any>(
  fn: T,
  arity: number = fn.length
): (...args: any[]) => any {
  return function curried(...args: any[]) {
    if (args.length >= arity) return fn(...args);
    return (...moreArgs: any[]) => curried(...args, ...moreArgs);
  };
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T & { clear: () => void } {
  const cache = new Map<string, ReturnType<T>>();
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T & { clear: () => void };
  memoized.clear = () => cache.clear();
  return memoized;
}

export function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = interval - (now - lastCall);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastCall = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}

export function tap<T>(value: T, sideEffect: (value: T) => void): T {
  sideEffect(value);
  return value;
}

export function negate<T extends (...args: any[]) => boolean>(predicate: T): (...args: Parameters<T>) => boolean {
  return (...args: Parameters<T>) => !predicate(...args);
}

export function constant<T>(value: T): () => T {
  return () => value;
}

export function identity<T>(value: T): T {
  return value;
}

export function noop(..._args: unknown[]): void {}

export function partial<T extends (...args: any[]) => any>(
  fn: T,
  ...presetArgs: any[]
): (...restArgs: any[]) => ReturnType<T> {
  return (...restArgs: any[]) => fn(...presetArgs, ...restArgs);
}
