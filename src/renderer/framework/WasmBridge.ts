import { process_ir } from '../../../core/rust/pkg/wasm_rust.js';
import { IRCommand, IRResult, BridgeInterface } from './types';

async function bridgeRaw(type: string, payload: any): Promise<any> {
    const command: IRCommand = { type, payload };
    const commandJson = JSON.stringify(command);
    
    console.debug(`[BAEX Bridge] Sending: ${commandJson}`);
    
    const rawResult: IRResult = await process_ir(commandJson);
    
    console.debug(`[BAEX Bridge] Received:`, rawResult);
    
    if (rawResult.type === 'Error') {
        console.error(`[BAEX Bridge] Anomaly: ${rawResult.payload}`);
        throw new Error(rawResult.payload as string);
    }
    
    return rawResult.payload;
}

export const WasmBridge: BridgeInterface = {
    compute: {
        add: async (a, b) => await bridgeRaw('Add', { a, b }),
        fibonacci: async (n) => await bridgeRaw('Fibonacci', { n }),
        factorial: async (n) => await bridgeRaw('Factorial', { n }),
    },
    text: {
        reverse: async (text) => await bridgeRaw('ReverseString', { text }),
        isPalindrome: async (text) => await bridgeRaw('PalindromeCheck', { text }),
    },
    system: {
        greet: async (name) => await bridgeRaw('Greet', { name }),
        reportAnomaly: async (message) => await bridgeRaw('ReportAnomaly', { message }),
        getRules: async () => await bridgeRaw('RulesQuery', {}),
    }
};
