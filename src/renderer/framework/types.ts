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
