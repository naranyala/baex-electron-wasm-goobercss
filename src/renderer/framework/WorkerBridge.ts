import { IRCommand } from './types';

export class WorkerBridge {
  private worker: Worker;
  private pendingRequests = new Map<number, { resolve: Function, reject: Function }>();
  private requestId = 0;

  constructor() {
    this.worker = new Worker(new URL('./WasmWorker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e: MessageEvent) => this.handleMessage(e);
  }

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

  terminate(): void {
    this.worker.terminate();
  }
}

export const workerBridge = new WorkerBridge();
