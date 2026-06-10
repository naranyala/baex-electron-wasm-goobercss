// @ts-ignore - Importing from public folder
import init from './wasm_logic.js';
import { EXBA } from '../framework/core/exba';

const WASM_METHODS = [
  { name: 'greet', description: 'Displays an alert greeting.' },
  {
    name: 'process_action',
    description: 'Processes an action and dispatches IR.',
  },
  {
    name: 'process_ir',
    description: 'Processes a raw IR command JSON string.',
  },
  { name: 'add', description: 'Adds two integers.' },
  { name: 'fibonacci', description: 'Calculates the Nth Fibonacci number.' },
  { name: 'wasm_get_app_state', description: 'Retrieves the global app state from WASM.' },
  { name: 'wasm_update_app_state', description: 'Updates the global app state in WASM.' },
] as const;

export function getExposedFunctions() {
  return WASM_METHODS.map((m) => ({
    name: m.name,
    description: m.description,
  }));
}

export async function setupBridge() {
  try {
    const module = await EXBA.initWasm(init);
    console.log('Wasm Engine initialized');

    const wasm = module as any;

    EXBA.setBridge({
      call: async (method, ...args) => {
        switch (method) {
          case 'greet': {
            wasm.greet(args[0]);
            return `Greeted ${args[0]}`;
          }
          case 'process_action': {
            const ir = wasm.process_action(args[0]);
            EXBA.dispatchIR(ir);
            return ir;
          }
          case 'process_ir': {
            return wasm.process_ir(args[0]);
          }
          case 'add': {
            return wasm.add(args[0], args[1]);
          }
          case 'fibonacci': {
            return wasm.fibonacci(args[0]);
          }
          case 'wasm_get_app_state': {
            return wasm.wasm_get_app_state();
          }
          case 'wasm_update_app_state': {
            return wasm.wasm_update_app_state(args[0]);
          }
          default:
            throw new Error(
              `Unknown bridge method: "${method}". Available: ${WASM_METHODS.map((m) => m.name).join(', ')}`,
            );
        }
      },
      on: (event, callback) => {
        EXBA.addEventListener(event, callback);
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to load WASM module: ${msg}`);
  }
}
