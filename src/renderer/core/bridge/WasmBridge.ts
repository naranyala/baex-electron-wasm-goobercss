import { workerBridge } from './WorkerBridge';
import { IRResult, BridgeInterface } from './types';

/**
 * Low-level utility to communicate with the WASM Worker via the WorkerBridge.
 * Handles error extraction from IRResult and logs anomalies.
 * 
 * @param {string} type - The IR command type (e.g., 'Add', 'Fibonacci').
 * @param {any} payload - The data required for the operation.
 * @returns {Promise<any>} The payload of the IRResult.
 * @throws {Error} If the worker returns an 'Error' type result or crashes.
 */
async function bridgeRaw(type: string, payload: any): Promise<any> {
    try {
        const rawResult: IRResult = await workerBridge.execute(type, payload);
        
        if (rawResult.type === 'Error') {
            console.error(`[BAEX Bridge] Anomaly: ${rawResult.payload}`);
            throw new Error(rawResult.payload as string);
        }
        
        return rawResult.payload;
    } catch (e: any) {
        console.error(`[BAEX Bridge] Worker Error: ${e.message}`);
        throw e;
    }
}

/**
 * The high-level API bridge that exposes WASM functionality to the rest of the application.
 * Organizes capabilities into logical groups: compute, text, and system.
 */
export const WasmBridge: BridgeInterface = {
    /** Mathematical computations performed in Rust. */
    compute: {
        /** Adds two numbers. */
        add: async (a, b) => await bridgeRaw('Add', { a, b }),
        /** Computes the Fibonacci sequence value for n. */
        fibonacci: async (n) => await bridgeRaw('Fibonacci', { n }),
        /** Computes the factorial of n. */
        factorial: async (n) => await bridgeRaw('Factorial', { n }),
    },
    /** String manipulation and analysis. */
    text: {
        /** Reverses the provided text. */
        reverse: async (text) => await bridgeRaw('ReverseString', { text }),
        /** Checks if a string is a palindrome. */
        isPalindrome: async (text) => await bridgeRaw('PalindromeCheck', { text }),
    },
    /** System-level operations and metadata. */
    system: {
        /** Sends a greeting to the user. */
        greet: async (name) => await bridgeRaw('Greet', { name }),
        /** Reports a system anomaly to the Rust logging layer. */
        reportAnomaly: async (message) => await bridgeRaw('ReportAnomaly', { message }),
        /** Retrieves the rules/schema of the current IR format. */
        getRules: async () => await bridgeRaw('RulesQuery', {}),
    }
};
