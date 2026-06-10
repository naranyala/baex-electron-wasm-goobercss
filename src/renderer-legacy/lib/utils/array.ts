export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(array: T[], keyFn: (item: T) => number): T[];
export function sortBy<T>(array: T[], keyFn: (item: T) => string): T[];
export function sortBy<T>(array: T[], keyFn: (item: T) => number | string): T[] {
  return [...array].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    if (ka < kb) return -1;
    if (ka > kb) return 1;
    return 0;
  });
}

export function sortByDesc<T>(array: T[], keyFn: (item: T) => number): T[];
export function sortByDesc<T>(array: T[], keyFn: (item: T) => string): T[];
export function sortByDesc<T>(array: T[], keyFn: (item: T) => number | string): T[] {
  return sortBy(array, keyFn as any).reverse();
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of array) {
    if (predicate(item)) pass.push(item);
    else fail.push(item);
  }
  return [pass, fail];
}

export function flattenDeep<T>(array: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (Array.isArray(item)) result.push(...flattenDeep(item));
    else result.push(item);
  }
  return result;
}

export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) result.push(i);
  } else {
    for (let i = start; i > end; i += step) result.push(i);
  }
  return result;
}

export function first<T>(array: T[]): T | undefined {
  return array[0];
}

export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export function take<T>(array: T[], n: number): T[] {
  return array.slice(0, n);
}

export function drop<T>(array: T[], n: number): T[] {
  return array.slice(n);
}

export function intersperse<T>(array: T[], separator: T): T[] {
  return array.flatMap((item, i) => (i === 0 ? [item] : [separator, item]));
}

export function countBy<T>(array: T[], keyFn: (item: T) => string): Record<string, number> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function differenceBy<T>(a: T[], b: T[], keyFn: (item: T) => unknown): T[] {
  const keys = new Set(b.map(keyFn));
  return a.filter(item => !keys.has(keyFn(item)));
}

export function intersectionBy<T>(a: T[], b: T[], keyFn: (item: T) => unknown): T[] {
  const keys = new Set(b.map(keyFn));
  return a.filter(item => keys.has(keyFn(item)));
}

export function minBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((min, item) => (keyFn(item) < keyFn(min) ? item : min));
}

export function maxBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((max, item) => (keyFn(item) > keyFn(max) ? item : max));
}

export function sumBy<T>(array: T[], keyFn: (item: T) => number): number {
  return array.reduce((acc, item) => acc + keyFn(item), 0);
}

export function averageBy<T>(array: T[], keyFn: (item: T) => number): number {
  if (array.length === 0) return 0;
  return sumBy(array, keyFn) / array.length;
}

export function isEmptyArray(value: unknown): value is [] {
  return Array.isArray(value) && value.length === 0;
}

export function zip<T, U>(a: T[], b: U[]): [T, U][] {
  const length = Math.min(a.length, b.length);
  const result: [T, U][] = [];
  for (let i = 0; i < length; i++) result.push([a[i], b[i]]);
  return result;
}

export function unzip<T, U>(pairs: [T, U][]): [T[], U[]] {
  const a: T[] = [];
  const b: U[] = [];
  for (const [x, y] of pairs) { a.push(x); b.push(y); }
  return [a, b];
}
