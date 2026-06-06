export interface EngineApi {
  compute: {
    add: (a: number, b: number) => Promise<number>;
    multiply: (a: number, b: number) => Promise<number>;
  };
  system: {
    log: (msg: string) => Promise<void>;
    getVersion: () => Promise<string>;
  };
}
