import { describe, it, expect, vi } from 'vitest';
import { WasmBridge } from './WasmBridge';
import * as wasm from '../../../core/rust/pkg/wasm_rust.js';

// Mock the wasm module
vi.mock('../../../core/rust/pkg/wasm_rust.js', () => ({
  process_ir: vi.fn(),
  default: vi.fn()
}));

describe('WasmBridge', () => {
  it('should call process_ir with correct JSON for Add', async () => {
    (wasm.process_ir as any).mockResolvedValue({ type: 'Number', payload: 30 });
    
    const result = await WasmBridge.compute.add(10, 20);
    
    expect(wasm.process_ir).toHaveBeenCalledWith(JSON.stringify({ type: 'Add', payload: { a: 10, b: 20 } }));
    expect(result).toBe(30);
  });

  it('should throw error on Anomaly', async () => {
    (wasm.process_ir as any).mockResolvedValue({ type: 'Error', payload: 'test error' });
    
    await expect(WasmBridge.compute.add(10, 20)).rejects.toThrow('test error');
  });
});
