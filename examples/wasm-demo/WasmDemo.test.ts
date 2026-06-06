import { describe, it, expect, vi } from 'vitest';
import './WasmDemo';
import { WasmBridge } from '../../src/renderer/framework/WasmBridge';

describe('WasmDemo', () => {
  it('should update result when computing fibonacci', async () => {
    const spy = vi.spyOn(WasmBridge.compute, 'fibonacci').mockResolvedValue(55);
    
    const el = document.createElement('baex-wasm-demo');
    document.body.appendChild(el);
    
    const btn = el.shadowRoot?.querySelector('#run');
    btn?.click();
    
    await vi.waitFor(() => {
      const result = el.shadowRoot?.querySelector('#result');
      if (result?.textContent !== 'Fibonacci(10) = 55') {
        throw new Error('Not updated yet');
      }
    }, { timeout: 1000 });
    
    spy.mockRestore();
  });
});
