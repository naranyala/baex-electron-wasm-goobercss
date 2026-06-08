import { IRCommand } from './types';

/**
 * Manages the lifecycle and communication with the WASM Worker.
 * Implements a request-response pattern over the postMessage API using unique IDs.
 */
export class WorkerBridge {
  private worker: Worker;
  /** Maps request IDs to their respective promise resolvers/rejecters. */
  private pendingRequests = new Map<number, { resolve: Function, reject: Function }>();
  private requestId = 0;

  constructor() {
    this.worker = new Worker(new URL('./WasmWorker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e: MessageEvent) => this.handleMessage(e);
  }

  /**
   * Processes messages returning from the worker and resolves the corresponding promise.
   * @param {MessageEvent} e - The message event from the worker.
   */
  private handleMessage(e: MessageEvent): void {
    const { id, result, error, status } = e.data;
    const promise = this.pendingRequests.get(id);
    if (promise) {
      if (status === 'success') {
        promise.resolve(result);
      } else {
        promise.reject(new Error(error));
      }
      this.pendingRequests.delete(id);
    }
  }

  /**
   * Sends a command to the WASM worker and returns a promise that resolves when the worker responds.
   * 
   * @param {string} type - The IR command type.
   * @param {any} payload - The payload for the command.
   * @returns {Promise<any>} The result produced by the WASM worker.
   */
  async execute(type: string, payload: any): Promise<any> {
    const id = this.requestId++;
    const command: IRCommand = { type, payload };
    const commandJson = JSON.stringify(command);
    
    const encoder = new TextEncoder();
    const buffer = encoder.encode(commandJson).buffer;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker.postMessage({ id, buffer }, [buffer]);
    });
  }

  /**
   * Terminates the worker thread and cleans up resources.
   */
  terminate(): void {
    this.worker.terminate();
  }
}

/** Singleton instance of the WorkerBridge for application-wide use. */
export const workerBridge = new WorkerBridge();
