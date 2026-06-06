import { BaseComponent } from '../../src/renderer/framework/BaseComponent';
import { WasmBridge } from '../../src/renderer/framework/WasmBridge';
import { css } from 'goober';

const styles = css`
  .wasm-card {
    padding: 1rem;
    border: 1px solid #3f3f46;
    border-radius: 0.5rem;
    background: #27272a;
    color: white;
  }
  .result { margin-top: 1rem; color: #a1a1aa; font-family: monospace; }
`;

export class WasmDemo extends BaseComponent {
  render() {
    this.shadow.innerHTML = `
      <style>${styles}</style>
      <div class="wasm-card">
        <h3>WASM Integration</h3>
        <button id="run">Compute Fibonacci(10)</button>
        <div id="result" class="result">Click to compute...</div>
      </div>
    `;

    this.shadow.getElementById('run')?.addEventListener('click', async () => {
      console.log('[WasmDemo] Clicked!');
      const res = await WasmBridge.compute.fibonacci(10);
      console.log('[WasmDemo] Result:', res);
      this.shadow.getElementById('result')!.textContent = `Fibonacci(10) = ${res}`;
    });
  }
}

customElements.define('baex-wasm-demo', WasmDemo);
