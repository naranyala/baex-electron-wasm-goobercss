export type Pipe<T> = {
  pipe: <U>(fn: (arg: T) => U) => Pipe<U>;
  value: () => T;
};

export function createPipe<T>(initialValue: T): Pipe<T> {
  return {
    pipe: <U>(fn: (arg: T) => U) => createPipe(fn(initialValue)),
    value: () => initialValue,
  };
}

export const compose = <T>(...fns: Array<(arg: any) => any>) => 
  (initialValue: T) => fns.reduce((val, fn) => fn(val), initialValue);
