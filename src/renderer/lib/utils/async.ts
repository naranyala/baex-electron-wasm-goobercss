export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function timeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message ?? `Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; delay?: number; backoff?: boolean } = {}
): Promise<T> {
  const { attempts = 3, delay = 300, backoff = true } = options;
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await wait(backoff ? delay * Math.pow(2, i) : delay);
      }
    }
  }
  throw lastError;
}

export async function asyncMap<T, R>(
  array: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency: number = Infinity
): Promise<R[]> {
  if (concurrency === Infinity) {
    return Promise.all(array.map(mapper));
  }
  const results: R[] = [];
  const queue = [...array.entries()];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const [index, item] = queue.shift()!;
      results[index] = await mapper(item, index);
    }
  });
  await Promise.all(workers);
  return results;
}

export function defer<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export async function attempt<T>(fn: () => Promise<T>): Promise<[T, null] | [null, Error]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

export function poll<T>(
  fn: () => T | Promise<T>,
  options: { interval: number; timeout: number; predicate: (value: T) => boolean }
): Promise<T> {
  const { interval, timeout: maxDuration, predicate } = options;
  const deadline = Date.now() + maxDuration;
  return new Promise((resolve, reject) => {
    const check = async () => {
      if (Date.now() > deadline) {
        reject(new Error('Poll timeout exceeded'));
        return;
      }
      try {
        const value = await fn();
        if (predicate(value)) {
          resolve(value);
          return;
        }
      } catch {}
      setTimeout(check, interval);
    };
    check();
  });
}

export async function sleepSort<T extends number>(numbers: T[]): Promise<T[]> {
  return new Promise(resolve => {
    const result: T[] = [];
    let settled = 0;
    for (const n of numbers) {
      setTimeout(() => {
        result.push(n);
        settled++;
        if (settled === numbers.length) resolve(result);
      }, n);
    }
  });
}
