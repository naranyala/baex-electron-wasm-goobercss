export interface ComponentDefinition {
  name: string;
  render: (state: any, helpers: any) => string;
  mounted?: (el: any, state: any) => void;
  autoUpdate?: boolean;
  events?: Record<string, (e: Event, state: any) => void | Promise<void>>;
}

export interface IRCommand<T = any> {
  type: string;
  payload: T;
}

export interface IRResult<T = any> {
  type: 'Number' | 'Void' | 'Error' | 'Rules';
  payload: T;
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
