import init, { process_ir } from '../../../core/rust/pkg/wasm_rust.js';

async function startWorker() {
  await init();
  
  self.onmessage = async (e: MessageEvent) => {
    const { id, buffer } = e.data;
    try {
      // Decode the transferred buffer back to JSON
      const decoder = new TextDecoder();
      const commandJson = decoder.decode(new Uint8Array(buffer));
      
      const result = process_ir(commandJson);
      self.postMessage({ id, result, status: 'success' });
    } catch (error: any) {
      self.postMessage({ id, error: error.message, status: 'error' });
    }
  };
}

startWorker();
