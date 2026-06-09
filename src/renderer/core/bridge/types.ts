export interface EventContext<S = any> {
  state: S;
  setState: (fn: (s: S) => Partial<S>) => void;
}

export interface ComponentDefinition<S = any> {
  name?: string;
  render?: (state: S, helpers: { setState: (fn: (s: S) => Partial<S>) => void }) => string;
  mounted?: (el: any, state: S) => void;
  autoUpdate?: boolean;
  events?: Record<string, (e: Event, ctx: EventContext<S>) => void | Promise<void>>;
}

export interface IRCommand<T = any> {
  type: string;
  payload: T;
}

export interface IRResult<T = any> {
  type: 'Number' | 'Void' | 'Error' | 'Rules';
  payload: T;
}

export interface SignalResult<T> {
  get: () => T | null;
  peek: () => T | null;
}

export type BridgeInterface = {
  compute: {
    add: (a: number, b: number) => Promise<number>;
    fibonacci: (n: number) => Promise<number>;
    factorial: (n: number) => Promise<number>;
  };
  text: {
    reverse: (text: string) => Promise<string>;
    isPalindrome: (text: string) => Promise<number>;
  };
  system: {
    greet: (name: string) => Promise<void>;
    reportAnomaly: (message: string) => Promise<void>;
    getRules: () => Promise<string>;
  };
};
