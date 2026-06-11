import type { IRBundle } from '../core/schema';

/**
 * Defines the required structure for an EXBA communication bridge.
 * All bridge implementations (WASM, Mock, etc.) must satisfy this interface.
 */
export interface ExbaBridge {
  /**
   * Invokes a remote method with the provided arguments.
   * @param method The name of the function to call.
   * @param args Array of arguments to pass to the function.
   * @returns A promise resolving to the function's return value.
   */
  call<T>(method: string, ...args: unknown[]): Promise<T>;
  
  /**
   * Registers a listener for an event emitted by the bridge.
   * @param event The event name.
   * @param callback The function to execute when the event occurs.
   */
  on(event: string, callback: (data: unknown) => void): void;
}

/**
 * Strongly typed interface representing the primary WASM API.
 * This provides IntelliSense for the most common framework-native calls.
 */
export interface BridgeAPI {
  /** Adds two integers. */
  add(a: number, b: number): Promise<number>;
  /** Computes the Nth Fibonacci number. */
  fibonacci(n: number): Promise<number>;
  /** Triggers a native system alert. */
  greet(name: string): Promise<void>;
  /** Processes a high-level UI action by ID. */
  process_action(id: string): Promise<IRBundle>;
  /** Processes a raw IR JSON string. */
  process_ir(json: string): Promise<IRBundle>;
}

/**
 * A proxy-based wrapper that provides a type-safe API over the raw bridge.
 * It automatically maps property access to bridge `call` invocations.
 * @param bridge The low-level bridge implementation.
 * @returns A Proxy matching the BridgeAPI interface.
 */
export function createTypedBridge(bridge: ExbaBridge): BridgeAPI {
  return new Proxy({} as BridgeAPI, {
    get(_, method: string) {
      return (...args: unknown[]) => bridge.call(method, ...args);
    },
  });
}
