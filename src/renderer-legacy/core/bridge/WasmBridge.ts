import { workerBridge } from './WorkerBridge.ts';
import { BridgeInterface } from './types.ts';
import { Command } from './CommandBuilder.ts';

async function bridgeRaw(type: string, payload: any): Promise<any> {
    try {
        const result = await workerBridge.execute(type, payload);
        // Ergonomic Fix: Auto-unwrap results and handle errors
        if (result.type === 'Error') {
            throw new Error(`Rust Error: ${result.payload.message || result.payload}`);
        }
        return result.payload;
    } catch (error) {
        console.error(`WasmBridge Error [${type}]:`, error);
        throw error;
    }
}

export { Command };

export const WasmBridge: BridgeInterface & { system: { execute: (type: string, payload: any) => Promise<any> } } = {
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
        systemFetch: async () => {
            const snapshot = (window as any).ipcRenderer.getSystemSnapshot();
            return await bridgeRaw('SystemFetch', { snapshot: JSON.stringify(snapshot) });
        },
        execute: async (type, payload) => await bridgeRaw(type, payload)
    }
};
