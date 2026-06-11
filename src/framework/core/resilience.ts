import { EXBA } from './exba';

/**
 * Defines the available rendering engines.
 * 'wasm' is the high-performance Tier 1 engine.
 * 'ts' is the robust Tier 2 fallback engine.
 */
export type EngineTier = 'wasm' | 'ts';

/**
 * Represents the current operational health of the WASM engine.
 */
export type EngineStatus = 'healthy' | 'degraded' | 'recovering' | 'failed';

/**
 * Manages the resilience and tiered rendering strategy of the framework.
 * Monitors WASM call success rates and automatically triggers fallbacks to 
 * the TypeScript engine if the WASM layer becomes unresponsive or fails.
 */
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

  /**
   * Returns the current health status of the engine.
   */
  static getStatus(): EngineStatus {
    return this.status;
  }

  /**
   * Determines which rendering/logic tier should be active based on current health.
   * @returns 'wasm' for the primary engine, or 'ts' for the fallback.
   */
  static getActiveTier(): EngineTier {
    if (this.DEBUG_FORCE_FALLBACK) return 'ts';
    return this.status === 'healthy' || this.status === 'recovering' ? 'wasm' : 'ts';
  }

  /**
   * Reports a successful WASM operation, resetting the failure counter.
   */
  static reportSuccess() {
    this.failureCount = 0;
    if (this.status === 'recovering') {
      this.status = 'healthy';
      EXBA.log('RESILIENCE', 'WASM Engine fully recovered');
    }
  }

  /**
   * Reports a failed WASM operation. If failure count exceeds threshold,
   * it triggers a fallback to the TS tier and schedules a recovery attempt.
   * @param reason The error or reason for failure.
   */
  static reportFailure(reason?: any) {
    this.failureCount++;
    EXBA.log('RESILIENCE', `WASM Call failed (${this.failureCount}/${this.MAX_FAILURES}): ${reason}`);

    if (this.failureCount >= this.MAX_FAILURES && this.status !== 'failed') {
      this.status = 'failed';
      EXBA.log('RESILIENCE_ALERT', 'CRITICAL: WASM engine failed. Switching to TS fallback tier.');
      this.attemptRecovery();
    }
  }

  /**
   * Schedules a background task to attempt re-stabilizing the WASM engine.
   */
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

  /**
   * Quick check to see if the WASM engine is currently considered operational.
   */
  static isWasmHealthy(): boolean {
    if (this.DEBUG_FORCE_FALLBACK) return false;
    return EXBA.wasmModule !== null && this.status !== 'failed';
  }
}
