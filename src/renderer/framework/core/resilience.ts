import { EXBA } from './exba';

export type EngineTier = 'wasm' | 'ts';
export type EngineStatus = 'healthy' | 'degraded' | 'recovering' | 'failed';

export class ResilienceManager {
  private static status: EngineStatus = 'healthy';
  private static failureCount = 0;
  private static MAX_FAILURES = 3;
  private static recoveryTimer: any = null;

  /**
   * Manual override to force the framework into TS fallback mode.
   * Useful for debugging UI and state logic without WASM interference.
   */
  public static DEBUG_FORCE_FALLBACK = false;

  static getStatus(): EngineStatus {
    return this.status;
  }

  static getActiveTier(): EngineTier {
    if (this.DEBUG_FORCE_FALLBACK) return 'ts';
    return this.status === 'healthy' || this.status === 'recovering' ? 'wasm' : 'ts';
  }

  static reportSuccess() {
    this.failureCount = 0;
    if (this.status === 'recovering') {
      this.status = 'healthy';
      EXBA.log('RESILIENCE', 'WASM Engine fully recovered');
    }
  }

  static reportFailure(reason?: any) {
    this.failureCount++;
    EXBA.log('RESILIENCE', `WASM Call failed (${this.failureCount}/${this.MAX_FAILURES}): ${reason}`);

    if (this.failureCount >= this.MAX_FAILURES && this.status !== 'failed') {
      this.status = 'failed';
      EXBA.log('RESILIENCE_ALERT', 'CRITICAL: WASM engine failed. Switching to TS fallback tier.');
      this.attemptRecovery();
    }
  }

  private static attemptRecovery() {
    if (this.recoveryTimer) return;

    this.recoveryTimer = setTimeout(async () => {
      this.status = 'recovering';
      EXBA.log('RESILIENCE', 'Attempting WASM engine re-initialization...');
      
      try {
        // Here we would trigger re-init logic
        this.recoveryTimer = null;
      } catch (e) {
        this.status = 'failed';
        this.recoveryTimer = null;
        this.attemptRecovery(); // Backoff
      }
    }, 5000); // 5s backoff
  }

  static isWasmHealthy(): boolean {
    if (this.DEBUG_FORCE_FALLBACK) return false;
    return EXBA.wasmModule !== null && this.status !== 'failed';
  }
}
