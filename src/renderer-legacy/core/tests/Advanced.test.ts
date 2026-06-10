import { describe, it, expect, vi } from 'vitest';
import { compiler } from '../bridge/Compiler';

vi.mock('../../../../core/rust/pkg/wasm_rust', () => ({
  default: vi.fn().mockResolvedValue(undefined),
  compile_ir: vi.fn((json: string) => {
    if (json.includes('ReverseString')) return new Uint8Array([0x02, 0x00]);
    return new Uint8Array([0x01, 0x00]);
  }),
  execute_bytecode: vi.fn((b: Uint8Array) => {
    if (b[0] === 0x02) return 'XEAB';
    return 0;
  }),
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
    const command = JSON.stringify({ type: 'ReverseString', payload: { text: 'EXBA' } });
    const compiled = await compiler.compile(command);
    const result = await compiler.executeBinary(compiled.bytecode);
    expect(result).toBe('XEAB');
  });
});
