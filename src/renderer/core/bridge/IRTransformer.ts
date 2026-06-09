import { HLIRCommand, IRResult } from './types';

export class IRValidator {
  /**
   * Validates if a command matches the HLIR specification.
   * Throws an error if invalid.
   */
  static validate(command: any): asserts command is HLIRCommand {
    if (!command || typeof command.type !== 'string') {
      throw new Error('IR Error: Command must have a string "type" property.');
    }

    const validTypes = [
      'Add', 'Fibonacci', 'Factorial', 'ReverseString', 
      'PalindromeCheck', 'Greet', 'ReportAnomaly', 'RulesQuery'
    ];

    if (!validTypes.includes(command.type)) {
      throw new Error(`IR Error: Unknown command type "${command.type}".`);
    }

    // Payload validation
    switch (command.type) {
      case 'Add':
        if (typeof command.payload?.a !== 'number' || typeof command.payload?.b !== 'number') {
          throw new Error('IR Error: "Add" requires numeric a and b in payload.');
        }
        break;
      case 'Fibonacci':
      case 'Factorial':
        if (typeof command.payload?.n !== 'number') {
          throw new Error(`IR Error: "${command.type}" requires numeric n in payload.`);
        }
        break;
      case 'ReverseString':
      case 'PalindromeCheck':
      case 'Greet':
      case 'ReportAnomaly':
        if (typeof command.payload?.text !== 'string' && typeof command.payload?.name !== 'string' && typeof command.payload?.message !== 'string') {
          throw new Error(`IR Error: "${command.type}" requires a string payload.`);
        }
        break;
      case 'RulesQuery':
        break;
    }
  }
}

export class IRTransformer {
  /**
   * Transforms a raw command into a validated HLIR command.
   */
  static toHLIR(type: string, payload: any): HLIRCommand {
    const command = { type, payload };
    IRValidator.validate(command);
    return command;
  }

  /**
   * Transforms a Rust IRResult into a usable JS value.
   */
  static resolveResult<T>(result: IRResult<T>): T {
    if (result.type === 'Error') {
      throw new Error(`Rust IR Error: ${result.payload as string}`);
    }
    return result.payload;
  }
}
