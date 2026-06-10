import type { IRBundle } from '../framework/core/schema';

export interface ExbaBridge {
  call<T>(method: string, ...args: unknown[]): Promise<T>;
  on(event: string, callback: (data: unknown) => void): void;
}

export interface BridgeAPI {
  add(a: number, b: number): Promise<number>;
  fibonacci(n: number): Promise<number>;
  greet(name: string): Promise<void>;
  process_action(id: string): Promise<IRBundle>;
  process_ir(json: string): Promise<IRBundle>;
}

/**
 * A proxy-based wrapper that provides a type-safe API over the raw bridge.
 */
export function createTypedBridge(bridge: ExbaBridge): BridgeAPI {
  return new Proxy({} as BridgeAPI, {
    get(_, method: string) {
      return (...args: unknown[]) => bridge.call(method, ...args);
    },
  });
}
