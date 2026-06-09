export type Maybe<T> = T | null | undefined;

export type Nullable<T> = T | null;

export type NonEmptyArray<T> = [T, ...T[]];

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

export type ValueOf<T> = T[keyof T];

export type KeyValueOf<T, K extends keyof T> = T[K];

export type EmptyObject = Record<string, never>;

export type Dictionary<T = unknown> = Record<string, T>;

export type Comparable = string | number | boolean | null | undefined;

export type Primitive = string | number | boolean | null | undefined | symbol | bigint;

export type Fn<A = unknown, B = unknown> = (...args: A[]) => B;

export type AsyncFn<A = unknown, B = unknown> = (...args: A[]) => Promise<B>;

export type Predicate<T> = (value: T) => boolean;

export type Mapper<T, R> = (value: T, index: number) => R;

export type Comparator<T> = (a: T, b: T) => number;

export type Equals<T> = (a: T, b: T) => boolean;

export const isNull = <T>(value: T | null): value is null => value === null;

export const isUndefined = (value: unknown): value is undefined => value === undefined;

export const isNil = <T>(value: T | null | undefined): value is null | undefined =>
  value === null || value === undefined;

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === 'function';

export const isArray = Array.isArray;

export const isPromise = (value: unknown): value is Promise<unknown> =>
  value instanceof Promise || (isObject(value) && isFunction((value as any).then));

export function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function nonNull<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function ensure<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) {
    throw new Error(message ?? `Expected non-null value but got ${String(value)}`);
  }
  return value;
}

export const noop = (): void => {};

export const identity = <T>(value: T): T => value;

export const constant = <T>(value: T) => (): T => value;

export function tryOrDefault<T>(fn: () => T, fallback: T): T {
  try { return fn(); }
  catch { return fallback; }
}
