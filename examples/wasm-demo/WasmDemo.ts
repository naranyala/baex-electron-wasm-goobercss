import { BaseComponent } from '../../src/renderer/core/ui/BaseComponent';
import { WasmBridge } from '../../src/renderer/core/bridge/WasmBridge';
import { createSignal, bindSignal } from '../../src/renderer/core/reactivity/Reactivity';
import { css } from 'goober';

const styles = css`
  .wasm-card {
    padding: 1rem;
    border: 1px solid #3f3f46;
    border-radius: 0.5rem;
    background: #27272a;
    color: white;
    max-width: 400px;
  }
  .result { margin-top: 1rem; color: #a1a1aa; font-family: monospace; }
  .signal-result { margin-top: 0.5rem; color: #22c55e; font-family: monospace; }
`;

export class WasmDemo extends BaseComponent {
  private fibSignal = createSignal<string>('Click to compute...');
  private fibId = 'fib-result';

  render() {
    return `
      <style>${styles}</style>
      <div class="wasm-card">
        <h3>WASM Integration</h3>
        <button id="compute-fib">Compute Fibonacci(10)</button>
        <div id="${this.fibId}" class="result">${this.fibSignal.peek()}</div>
        <div style="margin-top: 0.75rem; font-size: 0.8rem; color: #6b6b7b;">
          Result is bound via <code>bindSignal</code> — auto-updates on signal change.
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    const resultEl = this.shadow.getElementById(this.fibId);

    // Bind the signal to the DOM element for targeted updates
    bindSignal(resultEl, this.fibSignal, 'textContent');

    this.shadow.getElementById('compute-fib')?.addEventListener('click', async () => {
      this.fibSignal.set('Computing...');
      const res = await WasmBridge.compute.fibonacci(10);
      this.fibSignal.set(`Fibonacci(10) = ${res}`);
    });
  }
}

customElements.define('exba-wasm-demo', WasmDemo);
