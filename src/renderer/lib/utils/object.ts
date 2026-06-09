export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  for (const key of keys) delete result[key];
  return result;
}

export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return new Date(value.getTime()) as any;
  if (value instanceof RegExp) return new RegExp(value) as any;
  if (value instanceof Map) return new Map(Array.from(value.entries()).map(([k, v]) => [k, deepClone(v)])) as any;
  if (value instanceof Set) return new Set(Array.from(value.values()).map(v => deepClone(v))) as any;
  if (Array.isArray(value)) return value.map(deepClone) as any;
  const cloned: Record<string, unknown> = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      cloned[key] = deepClone((value as any)[key]);
    }
  }
  return cloned as T;
}

export function deepMerge<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  target: T,
  source: U
): T & U {
  const result = { ...target } as any;
  for (const key in source) {
    if (isObject(source[key]) && isObject(target[key])) {
      result[key] = deepMerge(target[key] as any, source[key] as any);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mapValues<T extends object, R>(
  obj: T,
  mapper: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = mapper(obj[key], key);
    }
  }
  return result;
}

export function mapKeys<T extends object>(
  obj: T,
  mapper: (key: keyof T, value: T[keyof T]) => string
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[mapper(key, obj[key])] = obj[key];
    }
  }
  return result;
}

export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

export function fromEntries<K extends string | number | symbol, V>(
  entries: [K, V][]
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isObject(value) && Object.keys(value).length === 0;
}

export function invert<K extends string | number | symbol, V extends string | number | symbol>(
  obj: Record<K, V>
): Record<V, K> {
  const result = {} as Record<V, K>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[obj[key]] = key;
    }
  }
  return result;
}

export function get<T, K extends keyof T>(obj: T, key: K): T[K] | undefined;
export function get<T, K extends keyof T>(obj: T, key: K, fallback: T[K]): T[K];
export function get<T, K extends keyof T>(obj: T, key: K, fallback?: T[K]): T[K] | undefined {
  return key in obj ? obj[key] : fallback;
}

export function set<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  obj[key] = value;
  return obj;
}

export function deepFreeze<T extends object>(obj: T): DeepFrozen<T> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as any)[key];
      if (value && typeof value === 'object') deepFreeze(value);
    }
  }
  return Object.freeze(obj) as DeepFrozen<T>;
}

type DeepFrozen<T> = T extends object
  ? { readonly [P in keyof T]: DeepFrozen<T[P]> }
  : T;
