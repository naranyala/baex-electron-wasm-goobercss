export interface EventContext<S = any> {
  state: S;
  setState: (fn: (s: S) => Partial<S>) => void;
}

export interface ComponentBindings<S = any> {
  text?: Record<string, (state: S) => string>;
  attr?: Record<string, { attr: string; value: (state: S) => string }>;
  class?: Record<string, { className: string; value: (state: S) => boolean }>;
}

export interface ComponentDefinition<S = any> {
  name: string;
  initialState: S;
  render: (state: S, props: Record<string, any>, context: EventContext<S>) => string | TemplateNode[];
  errorRender?: (error: Error, state: S) => string;
  bindings?: ComponentBindings<S>;
  mounted?: (el: HTMLElement, state: S, props: Record<string, any>) => void;
  unmounted?: (el: HTMLElement) => void;
  updated?: (el: HTMLElement, state: S, props: Record<string, any>) => void;
  events?: Record<string, (e: Event, ctx: EventContext<S>) => void | Promise<void>>;
  observedAttributes?: string[];
  autoUpdate?: boolean;
}

// --- High-Level IR (HLIR) ---

export type HLIRCommand = 
  | { type: 'Add'; payload: { a: number; b: number } }
  | { type: 'Fibonacci'; payload: { n: number } }
  | { type: 'Factorial'; payload: { n: number } }
  | { type: 'ReverseString'; payload: { text: string } }
  | { type: 'PalindromeCheck'; payload: { text: string } }
  | { type: 'Greet'; payload: { name: string } }
  | { type: 'ReportAnomaly'; payload: { message: string } }
  | { type: 'RulesQuery'; payload: undefined };

export interface IRResult<T = any> {
  type: 'Number' | 'Void' | 'Error' | 'Rules';
  payload: T;
}

// --- Low-Level IR (LLIR) ---

export interface LLIRBytecode {
  opcode: number;
  payload: Uint8Array;
  originalHLIR: HLIRCommand;
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

export type TemplateNode = 
  | { type: 'static'; content: string }
  | { type: 'dynamic'; content: (state: any) => string };
