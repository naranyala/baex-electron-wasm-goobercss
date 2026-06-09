import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workerBridge } from '../bridge/WorkerBridge';

// Mock the wasm module
vi.mock('../../../../core/rust/pkg/wasm_rust', () => ({
  default: vi.fn().mockResolvedValue(undefined),
  process_ir: vi.fn(),
}));

import { WasmBridge } from '../bridge/WasmBridge';
import * as wasm from '../../../../core/rust/pkg/wasm_rust';

describe('WasmBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call workerBridge.execute for Add', async () => {
    // Mock the worker response through the workerBridge instance
    const executeSpy = vi.spyOn(workerBridge, 'execute').mockResolvedValue({ 
      type: 'Number', 
      payload: 30 
    });
    
    const result = await WasmBridge.compute.add(10, 20);
    
    expect(executeSpy).toHaveBeenCalledWith('Add', { a: 10, b: 20 });
    expect(result).toBe(30);
  });

  it('should throw error when bridgeRaw fails', async () => {
    vi.spyOn(workerBridge, 'execute').mockRejectedValue(new Error('Bridge failure'));
    
    await expect(WasmBridge.compute.add(10, 20)).rejects.toThrow('Bridge failure');
  });
});
