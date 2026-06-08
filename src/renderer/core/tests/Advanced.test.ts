import { describe, it, expect, vi } from 'vitest';
import { compiler } from '../bridge/Compiler';

vi.mock('../../../core/rust/pkg/wasm_rust.js', () => ({
  default: vi.fn(),
  compile_ir: vi.fn(() => new Uint8Array([0x01, 0x00, 0x00, 0x00])),
  execute_bytecode: vi.fn(() => 0),
  init: vi.fn(),
}));

describe('Compiler', () => {
  it('should compile and execute bytecode', async () => {
    const command = JSON.stringify({ type: 'Add', payload: { a: 10, b: 20 } });
    const compiled = await compiler.compile(command);
    
    expect(compiled.bytecode).toBeDefined();
    
    const result = await compiler.executeBinary(compiled.bytecode);
    expect(result).toBe(0);
  });

  it('should handle complex string operations via bytecode', async () => {
    const command = JSON.stringify({ type: 'ReverseString', payload: { text: 'BAEX' } });
    const compiled = await compiler.compile(command);
    const result = await compiler.executeBinary(compiled.bytecode);
    expect(result).toBe('XEAB');
  });
});
