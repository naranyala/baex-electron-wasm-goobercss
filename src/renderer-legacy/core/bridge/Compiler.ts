import init, { compile_ir, execute_bytecode } from '../../../../core/rust/pkg/wasm_rust';

export interface CompiledScript {
  bytecode: Uint8Array;
  originalCommand: string;
}

export class Compiler {
  private initialized = false;

  async ensureInit() {
    if (!this.initialized) {
      await init();
      this.initialized = true;
    }
  }

  async compile(commandJson: string): Promise<CompiledScript> {
    await this.ensureInit();
    const bytecode = compile_ir(commandJson);
    return {
      bytecode: new Uint8Array(bytecode),
      originalCommand: commandJson,
    };
  }

  async executeBinary(bytecode: Uint8Array): Promise<any> {
    await this.ensureInit();
    return execute_bytecode(bytecode);
  }
}

export const compiler = new Compiler();
