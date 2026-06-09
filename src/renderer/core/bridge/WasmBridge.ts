import { workerBridge } from './WorkerBridge';
import { IRResult, BridgeInterface } from './types';
import { IRTransformer } from './IRTransformer';

async function bridgeRaw(type: string, payload: any): Promise<any> {
    try {
        const hlir = IRTransformer.toHLIR(type, payload);
        const rawResult: IRResult = await workerBridge.execute(hlir.type, hlir.payload);
        return IRTransformer.resolveResult(rawResult);
    } catch (e: any) {
        console.error(`[EXBA Bridge] Error: ${e.message}`);
        throw e;
    }
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
